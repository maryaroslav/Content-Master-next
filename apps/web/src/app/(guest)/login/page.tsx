import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';

import loginImg from '@images/auth/login_1.png';

export default function LoginPage() {
    return (
        <AuthLayout image={loginImg} imageAlt="login">
            <LoginForm />
        </AuthLayout>
    );
}
