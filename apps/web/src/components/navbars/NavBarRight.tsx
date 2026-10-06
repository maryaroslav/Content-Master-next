"use client";

import { useState } from 'react';
import Image from 'next/image';

import '@/styles/navBarRight.css'

import arrowDown from '@images/icons/arrow-down.svg';

const NavBarRight = () => {
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  return (
    <div className="sidebarRight-container">
      <div className='communities-section'>
        <div className='sidebar-name' onClick={() => setShowAllCommunities(!showAllCommunities)}>
          <p className="sidebar-title">Popular Tags</p>
          <Image src={arrowDown} alt="toggle" className={showAllCommunities ? "rotated" : ""} />
        </div>
      </div>
      <div className="events-section">
        <div className='sidebar-name' onClick={() => setShowAllEvents(!showAllEvents)}>
          <p className="sidebar-title">Podcasts</p>
          <Image src={arrowDown} alt="toggle" className={showAllEvents ? "rotated" : ""} />
        </div>
      </div>
    </div>
  )
}

export default NavBarRight;
