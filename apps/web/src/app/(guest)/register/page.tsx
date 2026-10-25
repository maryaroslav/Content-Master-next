import { getTranslations } from 'next-intl/server';
import AuthPage from '../components/AuthPage';
import RegisterForm from '../components/RegisterForm';

import registerImg from '@images/auth/register_1.png';

export default async function RegisterPage() {
    const t = await getTranslations('auth');
    return (
        <AuthPage title={t('register.title')} image={registerImg}>
            <RegisterForm />
        </AuthPage>
    );
}
