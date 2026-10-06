import { useFormContext } from '@cm/forms';
import type { CreateCommunityRequest } from '@cm/contracts';

const DESCRIPTION_LIMIT = 350;

const StepDescription = () => {
    const { register, watch } = useFormContext<CreateCommunityRequest>();
    const description = watch('description') ?? '';

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>Choose a description</h1>
                <p>Provide a brief description of your community. This can be updated later.</p>
            </div>
            <div className="createcommunity-type-content">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='type-content-name-counter'>
                        <label htmlFor="community-description">Description</label>
                        <p>{description.length}/{DESCRIPTION_LIMIT}</p>
                    </div>
                    <textarea
                        id="community-description"
                        className='createcommunity-type-content-textarea'
                        maxLength={DESCRIPTION_LIMIT}
                        {...register('description')}
                    />
                </form>
            </div>
        </div>
    );
};

export default StepDescription;
