import React, { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';

import addPhotoSVG from '@images/modal-create-community/add-photo.svg'

interface StepPhotoProps {
    photo: File | null;
    onChange: (photo: File | null) => void;
}

const StepPhoto = ({ photo, onChange }: StepPhotoProps) => {
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
                <h1>Add a photo</h1>
                <p>Upload an image that represents your community. You can change it later.</p>
            </div>
            <div className="createcommunity-type-content">
                <div className="createcommunity-add-photo" onClick={handleClick}>
                    {preview
                        ? <Image src={preview} alt="Selected photo" width={160} height={160} className="createcommunity-photo-preview" />
                        : <Image src={addPhotoSVG} alt='Add photo' />}
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
                    Selected: {photo.name}
                </div>
            )}
        </div>
    );
};

export default StepPhoto;