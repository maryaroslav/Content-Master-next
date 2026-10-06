import { useFormContext } from '@cm/forms';
import type { CreateCommunityRequest } from '@cm/contracts';

const NAME_LIMIT = 48;

const StepName = () => {
    const { register, watch } = useFormContext<CreateCommunityRequest>();
    const name = watch('name') ?? '';

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>Choose a name</h1>
                <p>Use words that reflect the idea of your community. You can change the name later.</p>
            </div>
            <div className="createcommunity-type-content">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='type-content-name-counter'>
                        <label htmlFor="community-name">Community name</label>
                        <p>{name.length}/{NAME_LIMIT}</p>
                    </div>
                    <input id="community-name" type="text" placeholder='Enter a name' maxLength={NAME_LIMIT} {...register('name')} />
                    <label htmlFor="community-privacy">Community privacy</label>
                    <select id="community-privacy" {...register('privacy')}>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </form>
            </div>
        </div>
    );
}

export default StepName;
