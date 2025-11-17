import Image from 'next/image';

interface CommunityCardProps {
  bg?: string;
  svg: string;
  color?: string;
};

const CommunityCard = ({ bg = '#ffffff', svg, color = '#000000' }: CommunityCardProps) => {
  return (
    <div className="card" style={{ backgroundColor: bg }}>
      <Image src={svg} alt="icon" width={40} height={40} style={{ filter: 'none' }} />
    </div>
  );
};

export default CommunityCard;