import AuthLayout from '../components/AuthLayout';
import RegisterForm from '../components/RegisterForm';

import registerImg from '@images/auth/register_1.png';

export default function RegisterPage() {
    return (
        <AuthLayout image={registerImg} imageAlt="register">
            <RegisterForm />
        </AuthLayout>
    );
}
