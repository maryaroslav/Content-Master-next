import { useEffect, useState } from 'react';

interface StepDescriptionProps {
    onValidChange?: (v: boolean) => void;
    onChange?: (description: string) => void;
    initialDes?: string;
}

const StepDescription = ({ onValidChange, onChange, initialDes = '' }: StepDescriptionProps) => {
    const [description, setDescription] = useState(initialDes);

    useEffect(() => {
        const valid = description.length > 0 && description.length <= 350;
        onValidChange?.(valid);
        onChange?.(description);
        // run once on mount intentionally
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const v = e.target.value;
        setDescription(v);
        const valid = v.length > 0 && v.length <= 350;
        onValidChange?.(valid);
        onChange?.(v);
    };

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>Choose a description</h1>
                <p>Provide a brief description of your community. This can be updated later.</p>
            </div>
            <div className="createcommunity-type-content">
                <form action="" onSubmit={(e) => e.preventDefault()}>
                    <div className='type-content-name-counter'>
                        <label htmlFor="">Description</label>
                        <p>{description.length}/350</p>
                    </div>
                    <textarea
                        className='createcommunity-type-content-textarea'
                        value={description}
                        onChange={handleDescriptionChange}
                        maxLength={350}
                    />
                </form>
            </div>
        </div>
    );
};

export default StepDescription;