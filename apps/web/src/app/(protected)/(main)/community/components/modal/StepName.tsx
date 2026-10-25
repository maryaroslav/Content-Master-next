import { useTranslations } from 'next-intl';
import type { CreateCommunityRequest } from '@cm/contracts';
import { useFormContext } from '@cm/forms';
import { SelectField, TextField } from '@cm/ui';
import { useErrorText } from '@/i18n/useErrorText';

const NAME_LIMIT = 48;

export default function StepName() {
    const t = useTranslations();
    const errorText = useErrorText();
    const { register, watch, setValue, formState: { errors } } = useFormContext<CreateCommunityRequest>();
    return (
        <>
            <TextField
                label={t('community.wizard.name.label')}
                maxLength={NAME_LIMIT}
                showCount
                autoFocus
                error={errorText.field(errors.name, 'name')}
                {...register('name')}
            />
            <SelectField
                label={t('community.wizard.name.privacy')}
                value={watch('privacy')}
                onChange={(e) => setValue('privacy', e.target.value as CreateCommunityRequest['privacy'], { shouldValidate: true })}
                error={errorText.field(errors.privacy, 'privacy')}
                options={[
                    { value: 'public', label: t('common.privacy.public') },
                    { value: 'private', label: t('common.privacy.private') },
                ]}
            />
        </>
    );
}
