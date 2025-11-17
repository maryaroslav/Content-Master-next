"use client";

import { useState } from 'react';
import Image from 'next/image';
// import CommunityCard from '../CommunityCard';

import '@/styles/navBarRight.css'

import arrowDown from '@images/icons/arrow-down.svg';

// const colors = [
//   { bg: '#E5F6FF', icon: '#E5F6FF' },
//   { bg: '#F1E9FF', icon: '#B792E5' },
//   { bg: '#EEFFE3', icon: '#82D62E' },
//   { bg: '#FFFCE3', icon: '#FFE000' },
//   { bg: '#E9FFF0', icon: '#72B7A7' },
// ]

const NavBarRight = () => {
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  // const [podcasts, setPodcasts] = useState([]);
  // const [items, setItems] = useState([]);

  // useEffect(() => {
  //   fetch("/data/tags.json")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const updatedData = data.map((item, index) => ({
  //         ...item,
  //         bg: colors[index % colors.length].b@
  //         color: colors[index % colors.length].icon
  //       }));
  //       setItems(updatedData);
  //     })
  //     .catch((err) => console.error(err));

  //   fetch("/data/podcasts.json")
  //     .then((res) => res.json())
  //     .then((data) => setPodcasts(data))
  //     .catch((err) => console.error(err));
  // }, []);

  return (
    <div className="sidebarRight-container">
      <div className='communities-section'>
        <div className='sidebar-name' onClick={() => setShowAllCommunities(!showAllCommunities)}>
          <p className="sidebar-title">Popular Tags</p>
          <Image src={arrowDown} alt="toggle" className={showAllCommunities ? "rotated" : "180deg"} />
        </div>
        {/* <div className="community-list">
          {(showAllCommunities ? items : items.slice(0, 4)).map((tag, index) => (
            <div key={index} className="community-item">
              <CommunityCard bg={tag.bg} svg={tag.svg} color={tag.color} />
              <div className='item-title'>
                <p className="community-name">{tag.tag}</p>
                <p className="community-members">{tag.postCount} posted by this tag</p>
              </div>
            </div>
          ))}
        </div> */}
      </div>
      <div className="events-section">
        <div className='sidebar-name' onClick={() => setShowAllEvents(!showAllEvents)}>
          <p className="sidebar-title">Podcasts</p>
          <Image src={arrowDown} alt="toggle" className={showAllEvents ? "rotated" : ""} />
        </div>
        {/* <div className="event-list">
          {(showAllEvents ? podcasts : podcasts.slice(0, 6)).map((podcast, index) => (
            <div key={index} className="event-item">
              <Image src={podcast.img} alt={podcast.title}/>
              <div className='item-title'>
                <p className="event-name">{podcast.title}</p>
                <p className="event-attendees">{podcast.author}</p>
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  )
}

export default NavBarRight;