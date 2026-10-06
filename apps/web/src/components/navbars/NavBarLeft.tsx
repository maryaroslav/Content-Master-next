'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUsersMyCommunities, useUsersMyEvents } from '@cm/api-client';
import { formatMembersCount } from '@/app/utils/FormatMembersCount';

import '@/styles/navBarLeft.css'

import arrowDown from '@images/icons/arrow-down.svg';

const NavBarLeft = () => {
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const { data: communities = [] } = useUsersMyCommunities();
  const { data: events = [] } = useUsersMyEvents();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  return (
    <div className="sidebar-container">
      <div className="communities-section">
        <div className='sidebar-name' onClick={() => setShowAllCommunities(!showAllCommunities)}>
          <p className="sidebar-title">My Community</p>
          <Image src={arrowDown} alt="" className={showAllCommunities ? "rotated" : "180deg"} />
        </div>
        <div className="community-list">
          {(showAllCommunities ? communities : communities.slice(0, 4)).map((community, index) => (
            <div key={community.id} className="community-item">
              <Image src={community.photo} width={100} height={100} alt="" />
              <div key={index} className='item-title'>
                <p className="community-type">{community.privacy}</p>
                <p className="community-name">{community.name}</p>
                <p className="community-members">{formatMembersCount(community.membersCount)} Members</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="events-section">
        <div className='sidebar-name' onClick={() => setShowAllEvents(!showAllEvents)}>
          <p className="sidebar-title">Events</p>
          <Image src={arrowDown} alt="" className={showAllEvents ? "rotated" : ""} />
        </div>
        <div className="event-list">
          {(showAllEvents ? events : events.slice(0, 6)).map((event, index) => (
            <div key={event.id} className="event-item">
              <Image src={event.image} width={100} height={100} alt="" />
              <div key={index} className='item-title'>
                <p className="event-date">{formatDate(event.createdAt)}</p>
                <p className="event-name">{event.title}</p>
                <p className="event-attendees">{formatMembersCount(event.membersCount ?? 0)} people have joined this event</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NavBarLeft;