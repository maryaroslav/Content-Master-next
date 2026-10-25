import { useTranslations } from 'next-intl';
import type { CreateCommunityRequest } from '@cm/contracts';
import { useFormContext } from '@cm/forms';
import { TextField } from '@cm/ui';
import { useErrorText } from '@/i18n/useErrorText';

const DESCRIPTION_LIMIT = 350;

export default function StepDescription() {
    const t = useTranslations('community.wizard');
    const errorText = useErrorText();
    const { register, formState: { errors } } = useFormContext<CreateCommunityRequest>();
    return (
        <>
            <TextField
                label={t('description.label')}
                multiline
                minRows={4}
                maxLength={DESCRIPTION_LIMIT}
                showCount
                autoFocus
                error={errorText.field(errors.description, 'description')}
                {...register('description')}
            />
        </>
    );
}
