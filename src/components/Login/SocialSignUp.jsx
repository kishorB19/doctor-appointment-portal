import React, { useState } from 'react';
import { FaFacebook, FaGithub } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGoogleLoginMutation } from '../../redux/api/authApi';

const SocialSignUp = () => {
    const [error, setError] = useState('');
    const [googleLogin] = useGoogleLoginMutation();
    const navigate = useNavigate();

    const handleGoogleSignIn = async (credentialResponse) => {
        try {
            const result = await googleLogin(credentialResponse.credential).unwrap();
            message.success('Successfully signed in with Google');
            navigate(result.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
        } catch (err) {
            const errorMessage = err?.data?.message || 'Google sign-in failed. Please try again.';
            setError(errorMessage);
            message.error(errorMessage);
        }
    };


    return (
        <div>
            <div className="social-media">
                <GoogleLogin
                    onSuccess={handleGoogleSignIn}
                    onError={() => setError('Google sign-in was cancelled or unavailable.')}
                    theme="outline"
                    size="medium"
                    text="continue_with"
                />
                <div className="social-icon">
                    <FaFacebook />
                </div>
                <div className="social-icon">
                    <FaGithub />
                </div>
            </div>
            {error && <h6 className="text-danger text-center p-2">{error}</h6>}

        </div>
    );
};

export default SocialSignUp;
