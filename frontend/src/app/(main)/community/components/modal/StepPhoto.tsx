import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

import addPhotoSVG from '@images/modal-create-community/add-photo.svg'

interface StepPhotoProps {
    onValidChange?: (v: boolean) => void;
    onChange?: (data: { photo: File | null }) => void;
    initialPhoto?: File | null;
}

const StepPhoto = ({ onValidChange, onChange, initialPhoto = null }: StepPhotoProps) => {
    const [photo, setPhoto] = useState<File | null>(initialPhoto);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const valid = !!photo;
        onValidChange?.(valid);
        onChange?.({ photo });
        // run once on mount intentionally
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        setPhoto(f);
        onValidChange?.(!!f);
        onChange?.({ photo: f });
    };

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>Add a photo</h1>
                <p>Upload an image that represents your community. You can change it later.</p>
            </div>
            <div className="createcommunity-type-content">
                <div className="createcommunity-add-photo" onClick={handleClick}>
                    <Image src={addPhotoSVG} alt='Add photo' />
                </div>
            </div>

            <input
                type="file"
                accept='image/'
                ref={fileInputRef}
                onChange={handleFile}
                style={{ display: 'none' }}
            />

            {photo && (
                <div>
                    Selected: {photo.name}
                </div>
            )}
        </div>
    );
};

export default StepPhoto;