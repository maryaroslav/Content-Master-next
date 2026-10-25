import { useTranslations } from 'next-intl';
import { ImagePicker } from '@cm/ui';

interface StepPhotoProps {
    photo: File | null;
    onChange: (photo: File | null) => void;
}

export default function StepPhoto({ photo, onChange }: StepPhotoProps) {
    const t = useTranslations('community.wizard.photo');
    return <ImagePicker value={photo} onChange={onChange} addLabel={t('add')} changeLabel={t('change')} previewAlt={t('preview')} testId="community-photo" />;
}
