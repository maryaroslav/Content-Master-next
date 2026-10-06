"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getErrorMessage } from '@cm/api-client';
import { login, loginWithTwoFactor, register } from '@cm/auth';
import { useRouter } from 'next/navigation';

import '@/styles/authForm.css';
import loginImg from '@images/auth/login_1.png';
import registerImg from '@images/auth/register_1.png';
import crossImg from '@images/icons/cross.svg';

interface AuthFormProps {
    type: "login" | "register";
}

const AuthForm = ({ type }: AuthFormProps) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [is2FARequired, setIs2FARequired] = useState(false);
    const [twoFACode, setTwoFACode] = useState('');
    const [challengeToken, setChallengeToken] = useState<string | null>(null);

    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        if (!email.includes('@')) {
            setError('Please enter a valid email');
            setLoading(false);
            return;
        }

        if (type === 'register' && password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        if (type === 'register' && username.length < 5) {
            setError('Username must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            if (type === 'register') {
                await register({ email, password, username });
            } else if (is2FARequired && challengeToken) {
                await loginWithTwoFactor({ challengeToken, code: twoFACode.trim() });
            } else {
                const result = await login({ email, password });
                if (result.status === 'twoFactorRequired') {
                    setIs2FARequired(true);
                    setChallengeToken(result.challengeToken);
                    setError('Enter your 2FA code');
                    setLoading(false);
                    return;
                }
            }
            router.push('/explore');
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    return (
        <div className="container-auth">
            <div className='form-container'>
                <form onSubmit={handleSubmit}>
                    <h1>{type === 'login' ? 'Sign In to your account' : 'Create your account'}</h1>
                    {error &&
                        <div className={error === 'Enter your 2FA code' ? 'twofa-message' : 'error-message'}>
                            <Image src={crossImg} width={25} height={25} alt='error' />
                            <p>{error}</p>
                        </div>
                    }
                    <div className='input-email input-box'>
                        <p>Email</p>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div className='input-password input-box'>
                        <p>Password</p>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className={error && type === 'register' && password.length < 8 ? 'input-error' : ''}
                        />
                    </div>
                    {is2FARequired && (
                        <div className="input-twofa input-box">
                            <p>2FA code</p>
                            <input
                                type="text"
                                placeholder='Enter 2FAcode'
                                value={twoFACode}
                                onChange={(e) => setTwoFACode(e.target.value)}
                                required
                                className={error && type === 'login' && error ? 'input-error' : ''}
                            />
                        </div>
                    )}
                    {type === 'register' && (
                        <div className='input-username input-box'>
                            <p>Username</p>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                required
                                className={error && type === 'register' && username.length < 5 ? 'input-error' : ''}
                            />
                        </div>
                    )}
                    <button className='btn-authForm' type="submit">{type === 'login' ? 'Sign In' : 'Sign Up'}</button>
                    {type === 'login' ? (
                        <div className='register'>
                            <p>Don’t have an account? <Link href="/register">Create account</Link></p>
                        </div>
                    ) : (
                        <div className='register'>
                            <p>Already have an account? <Link href="/login">Sign in</Link></p>
                        </div>
                    )}
                </form>
            </div>
            <div className='image'>
                {type === 'login' ? <Image src={loginImg} alt="login"></Image> : <Image src={registerImg} alt="register"></Image>}
            </div>
        </div>
    );
};

export default AuthForm;