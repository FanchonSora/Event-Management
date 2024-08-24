"use client";

import React from 'react';
import { useRouter } from 'next/router';
import styles from './Event.module.css';

interface EventProps {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  isUserEvent: boolean;
  eventId: string;
}

const Event: React.FC<EventProps> = ({
  title,
  description,
  date,
  time,
  location,
  imageUrl,
  isUserEvent,
  eventId,
}) => {
  const router = useRouter();

  const handleJoinClick = () => {
    router.push({
      pathname: '/mainEvent',
      query: { eventId },
    });
  };

  return (
    <div className={styles.eventContainer}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className={styles.eventImage} />
        ) : (
          <div className={styles.noImage}>No Image Available</div>
        )}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <p className={styles.date}>Date: {date}</p>
      <p className={styles.time}>Time: {time}</p>
      <p className={styles.location}>Location: {location}</p>
      {isUserEvent ? (
        <div className={styles.buttonsContainer}>
          {/* Add buttons for edit and delete */}
        </div>
      ) : (
        <button className={styles.joinButton} onClick={handleJoinClick}>
          Join this event!
        </button>
      )}
    </div>
  );
};

export default Event;
