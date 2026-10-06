'use client';

import Link from 'next/link';
import { register as registerAccount } from '@cm/auth';
import { RegisterRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import Field from './Field';
import FormMessage from './FormMessage';

export default function RegisterForm() {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useZodForm(RegisterRequestSchema, {
        defaultValues: { email: '', password: '', username: '' },
    });

    const onSubmit = handleSubmit(async (data) => {
        try {
            await registerAccount(data);
        } catch (err) {
            applyServerErrors(setError, err, ['email', 'password', 'username']);
        }
    });

    const message = errors.email?.message ?? errors.password?.message ?? errors.username?.message ?? errors.root?.server?.message;

    return (
        <form onSubmit={onSubmit} noValidate>
            <h1>Create your account</h1>
            {message && <FormMessage message={message} />}
            <Field label="Email" type="email" placeholder="Email" autoComplete="email" invalid={!!errors.email} {...register('email')} />
            <Field
                label="Password"
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                invalid={!!errors.password}
                {...register('password')}
            />
            <Field
                label="Username"
                type="text"
                placeholder="Username"
                autoComplete="username"
                invalid={!!errors.username}
                {...register('username')}
            />
            <button className="btn-authForm" type="submit" disabled={isSubmitting}>Sign Up</button>
            <div className="register">
                <p>Already have an account? <Link href="/login">Sign in</Link></p>
            </div>
        </form>
    );
}
