import React, { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import addPhotoSVG from '@images/modal-create-community/add-photo.svg'

interface StepPhotoProps {
    photo: File | null;
    onChange: (photo: File | null) => void;
}

const StepPhoto = ({ photo, onChange }: StepPhotoProps) => {
    const t = useTranslations('community.wizard.photo');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.files?.[0] ?? null);
    };

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>{t('title')}</h1>
                <p>{t('text')}</p>
            </div>
            <div className="createcommunity-type-content">
                <div className="createcommunity-add-photo" onClick={handleClick}>
                    {preview
                        ? <Image src={preview} alt={t('preview')} width={160} height={160} className="createcommunity-photo-preview" />
                        : <Image src={addPhotoSVG} alt={t('add')} />}
                </div>
            </div>

            <input
                type="file"
                accept='image/*'
                ref={fileInputRef}
                onChange={handleFile}
                style={{ display: 'none' }}
            />

            {photo && (
                <div>
                    {t('selected', { name: photo.name })}
                </div>
            )}
        </div>
    );
};

export default StepPhoto;