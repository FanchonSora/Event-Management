'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styles from './Event_creation.module.css';

const EventCreatePage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [mapLocation, setMapLocation] = useState<google.maps.LatLng | null>(null);

  const router = useRouter();
  const db = getFirestore();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && date && location) {
      try {
        await addDoc(collection(db, 'events'), {
          name,
          description,
          date,
          location,
          imagePath,
          coordinates: mapLocation ? {
            lat: mapLocation.lat(),
            lng: mapLocation.lng(),
          } : null,
          uid: auth.currentUser?.uid,
        });
        alert('Event created successfully!');
        router.push('/'); // Navigate back to the home page or another page
      } catch (error) {
        console.error('Error creating event:', error);
      }
    } else {
      alert('Please fill out all required fields.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Create New Event</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Event Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label>
          Date:
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </label>
        <label>
          Image Path:
          <input
            type="text"
            value={imagePath}
            onChange={(e) => setImagePath(e.target.value)}
          />
        </label>
        <div className={styles.buttonContainer}>
          <button type="button" onClick={() => router.push('/mapsCreate')}>Select Location</button>
          <button type="submit">Create Event</button>
        </div>
      </form>
    </div>
  );
};

export default EventCreatePage;
