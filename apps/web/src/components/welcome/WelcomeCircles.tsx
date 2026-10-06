import Image, { type StaticImageData } from 'next/image';
import * as icons from './illustrations';

type Item = { icon: StaticImageData; grey: boolean };

const grey = (icon: StaticImageData): Item => ({ icon, grey: true });
const plain = (icon: StaticImageData): Item => ({ icon, grey: false });

const rings: Item[][] = [
    [grey(icons.hat), grey(icons.fire)],
    [plain(icons.heart), grey(icons.bank), grey(icons.guitar), plain(icons.green), plain(icons.green), grey(icons.ball)],
    [grey(icons.bag), grey(icons.tent), grey(icons.gamepad), grey(icons.light), plain(icons.heart)],
    [grey(icons.like), grey(icons.smile), grey(icons.hand)],
];

function Ring({ level }: { level: number }) {
    const items = rings[level];
    if (!items) return null;
    return (
        <div className={`circle-${level + 1} circle`}>
            {items.map(({ icon, grey: withBackground }, i) => (
                <div key={i} className={withBackground ? 'emoji-greyBackground greyBackground' : 'emoji-container'}>
                    <Image src={icon} alt="" />
                </div>
            ))}
            <Ring level={level + 1} />
        </div>
    );
}

export default function WelcomeCircles() {
    return (
        <div className="circles-container" aria-hidden="true">
            <Ring level={0} />
        </div>
    );
}
