import { useEffect, useState } from 'react';

type Privacy = 'public' | 'private';

interface StepNameProps {
    onValidChange?: (valid: boolean) => void;
    onChange?: (data: { name: string; privacy: Privacy }) => void;
    initialName?: string;
    initialPrivacy?: Privacy;
}

const StepName = ({ onValidChange, onChange, initialName = '', initialPrivacy = 'public' }: StepNameProps) => {
    const [name, setName] = useState<string>(initialName);
    const [privacy, setPrivacy] = useState<Privacy>(initialPrivacy);

    useEffect(() => {
        const valid = name.trim().length > 0 && name.length <= 48;
        onValidChange?.(valid);
        onChange?.({ name, privacy });
        // run once on mount intentionally
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setName(v);
        const valid = v.trim().length > 0 && v.length <= 48;
        onValidChange?.(valid);
        onChange?.({ name: v, privacy });
    };

    const handlePrivacyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const p = e.target.value as Privacy;
        setPrivacy(p);
        const valid = name.trim().length > 0 && name.length <= 48;
        onValidChange?.(valid);
        onChange?.({ name, privacy: p });
    };

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>Choose a name</h1>
                <p>Use words that reflect the idea of your community. You can change the name later.</p>
            </div>
            <div className="createcommunity-type-content">
                <form action="" onSubmit={(e) => e.preventDefault()}>
                    <div className='type-content-name-counter'>
                        <label htmlFor="">Community name</label>
                        <p>{name.length}/48</p>
                    </div>
                    <input
                        type="text"
                        placeholder='Enter a name'
                        value={name}
                        onChange={handleNameChange}
                        maxLength={48}
                    />
                    <label htmlFor="">Community privacy</label>
                    <select name="" id="" value={privacy} onChange={handlePrivacyChange}>
                        <option value="public">Public</option>
                        <option value="private">Privat</option>
                    </select>
                </form>
            </div>
        </div>
    );
}

export default StepName;