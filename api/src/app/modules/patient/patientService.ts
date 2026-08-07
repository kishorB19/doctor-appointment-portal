import httpStatus from "http-status";
import ApiError from "../../../errors/apiError";
import prisma from "../../../shared/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from 'bcrypt';

export const create = async (payload: any): Promise<any> => {
    try {
        const { password, ...othersData } = payload;

        const existEmail = await prisma.auth.findUnique({ where: { email: othersData.email } });
        const existPatient = await prisma.patient.findFirst({ where: { email: othersData.email } });
        if (existEmail || existPatient) {
            throw new ApiError(httpStatus.BAD_REQUEST, "An account with this email already exists!");
        }

        const data = await prisma.$transaction(async (tx) => {
            const patient = await tx.patient.create({
                data: othersData,
            });

            const auth = await tx.auth.create({
                data: {
                    email: patient.email,
                    password: password && await bcrypt.hashSync(password, 12),
                    role: UserRole.patient,
                    userId: patient.id
                },
            });
            return {
                patient,
                auth,
            };
        });

        return data;
    } catch (error: any) {
        throw new ApiError(httpStatus.BAD_REQUEST, error.message)
    }
};