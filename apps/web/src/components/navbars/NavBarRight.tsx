"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import '@/styles/navBarRight.css'

import arrowDown from '@images/icons/arrow-down.svg';

const NavBarRight = () => {
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const t = useTranslations('nav');

  return (
    <div className="sidebarRight-container">
      <div className='communities-section'>
        <div className='sidebar-name' onClick={() => setShowAllCommunities(!showAllCommunities)}>
          <p className="sidebar-title">{t('popularTags')}</p>
          <Image src={arrowDown} alt="" className={showAllCommunities ? "rotated" : ""} />
        </div>
      </div>
      <div className="events-section">
        <div className='sidebar-name' onClick={() => setShowAllEvents(!showAllEvents)}>
          <p className="sidebar-title">{t('podcasts')}</p>
          <Image src={arrowDown} alt="" className={showAllEvents ? "rotated" : ""} />
        </div>
      </div>
    </div>
  )
}

export default NavBarRight;
