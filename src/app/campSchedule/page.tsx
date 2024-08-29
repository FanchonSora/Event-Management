"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Schedule.module.css';

const ImageDisplayPage: React.FC = () => {
  const router = useRouter();
  const imageUrl = '/image/schedule.png'; // Replace with your image URL

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<string>('');

  useEffect(() => {
    const updateTimeAndDay = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const day = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      setCurrentTime(time);
      setCurrentDay(day);
    };

    updateTimeAndDay();
    const intervalId = setInterval(updateTimeAndDay, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  const handleReturnClick = () => {
    router.push('/home'); // Adjust the path as needed to return to the home page
  };

  return (
    <div className={styles.pageContainer}>
      <button onClick={handleReturnClick} className={styles.returnButton}>
        Return
      </button>
      <div className={styles.timeContainer}>
        <div className={styles.currentDay}>{currentDay}</div>
        <div className={styles.currentTime}>{currentTime}</div>
      </div>
      <div className={styles.container}>
        <img src={imageUrl} alt="Displayed Image" className={styles.image} />
      </div>
    </div>
  );
};

export default ImageDisplayPage;
