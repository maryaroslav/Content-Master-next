import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChoiceCard, Stack } from '@cm/ui';

import blogImg from '@images/modal-create-community/blog-type.svg';
import businessImg from '@images/modal-create-community/business-type.svg';
import eventsImg from '@images/modal-create-community/events-type.svg';

const goals = [
    { key: 'blog', image: blogImg },
    { key: 'business', image: businessImg },
    { key: 'events', image: eventsImg },
] as const;

export default function StepGoal({ onSelect }: { onSelect: () => void }) {
    const t = useTranslations('community.wizard.goal');
    return (
        <Stack gap={2}>
            {goals.map((goal) => (
                <ChoiceCard
                    key={goal.key}
                    image={<Image src={goal.image} alt="" width={56} height={56} />}
                    title={t(`${goal.key}Title`)}
                    text={t(`${goal.key}Text`)}
                    onClick={onSelect}
                />
            ))}
        </Stack>
    );
}
