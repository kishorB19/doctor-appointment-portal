import bcrypt from 'bcrypt';
import prisma from "../../../shared/prisma";
import ApiError from '../../../errors/apiError';
import httpStatus from 'http-status';
import { JwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';
import moment from 'moment';
import { EmailtTransporter } from '../../../helpers/emailTransporter';
const { v4: uuidv4 } = require('uuid');
import * as path from 'path';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(config.googleClientId);

type ILginResponse = {
    accessToken?: string;
    user: {}
}

const loginUser = async (user: any): Promise<ILginResponse> => {
    const { email: IEmail, password } = user;
    const isUserExist = await prisma.auth.findUnique({
        where: { email: IEmail }
    })

    if (!isUserExist) {
        throw new ApiError(httpStatus.NOT_FOUND, "User is not Exist !");
    }
    // check Verified doctor or not
    if (isUserExist.role === 'doctor') {
        const getDoctorInfo = await prisma.doctor.findUnique({
            where: {
                email: isUserExist.email
            }
        })
        if (getDoctorInfo && getDoctorInfo?.verified === false) {
            throw new ApiError(httpStatus.NOT_FOUND, "Please Verify Your Email First !");
        }
    }
    const isPasswordMatched = await bcrypt.compare(password, isUserExist.password);

    if (!isPasswordMatched) {
        throw new ApiError(httpStatus.NOT_FOUND, "Password is not Matched !");
    }
    const { role, userId, isDemo, email } = isUserExist;
    const accessToken = JwtHelper.createToken(
        { role, userId, email, isDemo: role === 'admin' ? Boolean(isDemo) : false },
        config.jwt.secret as Secret,
        config.jwt.JWT_EXPIRES_IN as string
    )
    return {
        accessToken,
        user: { role, userId, email, isDemo: role === 'admin' ? Boolean(isDemo) : false },
    }
}

const googleLogin = async ({ credential }: { credential?: string }): Promise<ILginResponse> => {
    if (!credential) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Google credential is required.');
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: config.googleClientId,
        });
        payload = ticket.getPayload();
    } catch {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Google sign-in could not be verified.');
    }

    if (!payload?.email || !payload.email_verified) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'A verified Google email address is required.');
    }

    let user = await prisma.auth.findUnique({ where: { email: payload.email } });

    if (!user) {
        const existingPatient = await prisma.patient.findUnique({ where: { email: payload.email } });
        const existingDoctor = await prisma.doctor.findUnique({ where: { email: payload.email } });

        const nameParts = (payload.name || payload.email.split('@')[0]).trim().split(/\s+/);
        const firstName = nameParts[0] || 'Google';
        const lastName = nameParts.slice(1).join(' ') || 'User';
        const password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

        if (existingPatient) {
            user = await prisma.auth.create({
                data: {
                    email: payload.email,
                    password,
                    role: 'patient',
                    userId: existingPatient.id,
                },
            });
        } else if (existingDoctor) {
            user = await prisma.auth.create({
                data: {
                    email: payload.email,
                    password,
                    role: 'doctor',
                    userId: existingDoctor.id,
                },
            });
        } else {
            const created = await prisma.$transaction(async (tx) => {
                const patient = await tx.patient.create({
                    data: {
                        firstName,
                        lastName,
                        email: payload!.email!,
                        img: payload!.picture || undefined,
                    },
                });
                return tx.auth.create({
                    data: {
                        email: patient.email,
                        password,
                        role: 'patient',
                        userId: patient.id,
                    },
                });
            });
            user = created;
        }
    }

    const { role, userId, isDemo, email } = user;
    const accessToken = JwtHelper.createToken(
        { role, userId, email, isDemo: role === 'admin' ? Boolean(isDemo) : false },
        config.jwt.secret as Secret,
        config.jwt.JWT_EXPIRES_IN as string,
    );
    return {
        accessToken,
        user: { role, userId, email, isDemo: role === 'admin' ? Boolean(isDemo) : false },
    };
};

const VerificationUser = async (user: any): Promise<ILginResponse> => {
    const { email: IEmail, password } = user;
    const isUserExist = await prisma.auth.findUnique({
        where: { email: IEmail }
    })

    if (!isUserExist) {
        throw new ApiError(httpStatus.NOT_FOUND, "User is not Exist !");
    }
    const isPasswordMatched = await bcrypt.compare(password, isUserExist.password);

    if (!isPasswordMatched) {
        throw new ApiError(httpStatus.NOT_FOUND, "Password is not Matched !");
    }
    const { role, userId, isDemo, email } = isUserExist;
    const accessToken = JwtHelper.createToken(
        { role, userId, email, isDemo: role === 'admin' ? Boolean(isDemo) : false },
        config.jwt.secret as Secret,
        config.jwt.JWT_EXPIRES_IN as string
    )
    return {
        accessToken,
        user: { role, userId, email, isDemo: role === 'admin' ? Boolean(isDemo) : false },
    }
}

const resetPassword = async (payload: any): Promise<{ message: string }> => {
    const { email } = payload;
    const isUserExist = await prisma.auth.findUnique({
        where: { email: email }
    })
    if (!isUserExist) {
        throw new ApiError(httpStatus.NOT_FOUND, "User is not Exist !");
    }
    const clientUrl = `${config.clientUrl}/reset-password/`
    const uniqueString = uuidv4() + isUserExist.id;
    const uniqueStringHashed = await bcrypt.hashSync(uniqueString, 12);
    const encodedUniqueStringHashed = uniqueStringHashed.replace(/\//g, '-');

    const resetLink = clientUrl + isUserExist.id + '/' + encodedUniqueStringHashed;
    const currentTime = moment();
    const expiresTime = moment(currentTime).add(4, 'hours');

    await prisma.$transaction(async (tx) => {
        //Check if the forgotPassword record exists before attempting reset
        const existingForgotPassword = await tx.forgotPassword.findUnique({
            where: { id: isUserExist.id }
        });
        if (existingForgotPassword) {
            await tx.forgotPassword.delete({
                where: { id: isUserExist.id }
            })
        }

        const forgotPassword = await tx.forgotPassword.create({
            data: {
                userId: isUserExist.id,
                expiresAt: expiresTime.toDate(),
                uniqueString: resetLink
            }
        });
        
        if (forgotPassword) {
            const pathName = path.join(__dirname, '../../../../template/resetPassword.html')
            const obj = {
                link: resetLink
            };
            const subject = "Request to Reset Password";
            const toMail = isUserExist.email;
            try {
                await EmailtTransporter({ pathName, replacementObj: obj, toMail, subject })
            } catch (error) {
                console.log("Error reset password email", error);
                throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Unable to send reset email!")
            }
        }
        return forgotPassword;
    });


    return {
        message: "Password Reset Successfully !!"
    };
}

const PassworResetConfirm = async (payload: any): Promise<any> => {
    const { userId, uniqueString, password } = payload;

    await prisma.$transaction(async (tx) => {
        const isUserExist = await tx.auth.findUnique({
            where: { id: userId }
        });

        if (!isUserExist) { throw new ApiError(httpStatus.NOT_FOUND, "User is not Exist !") };
        const resetLink = `${config.clientUrl}/reset-password/${isUserExist.id}/${uniqueString}`
        const getForgotRequest = await tx.forgotPassword.findFirst({
            where: {
                userId: userId as string,
                uniqueString: resetLink
            }
        })
        if (!getForgotRequest) { throw new ApiError(httpStatus.NOT_FOUND, "Forgot Request was not found or Invalid !") };

        const expiresAt = moment(getForgotRequest.expiresAt);
        const currentTime = moment();
        if (expiresAt.isBefore(currentTime)) {
            throw new ApiError(httpStatus.NOT_FOUND, "Forgot Request has been expired !")
        } else {
            await tx.auth.update({
                where: {
                    id: userId
                },
                data: {
                    password: password && await bcrypt.hashSync(password, 12)
                }
            });
            await prisma.forgotPassword.delete({
                where: {
                    id: getForgotRequest.id
                }
            })
        }
    });
    return {
        message: "Password Changed Successfully !!"
    }
}

export const AuthService = {
    loginUser,
    googleLogin,
    VerificationUser,
    resetPassword,
    PassworResetConfirm
}
