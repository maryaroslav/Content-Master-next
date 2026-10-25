import { getTranslations } from 'next-intl/server';
import AuthPage from '../components/AuthPage';
import LoginForm from '../components/LoginForm';

import loginImg from '@images/auth/login_1.png';

export default async function LoginPage() {
    const t = await getTranslations('auth');
    return (
        <AuthPage title={t('login.title')} image={loginImg}>
            <LoginForm />
        </AuthPage>
    );
}
