'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styles from './Event_update.module.css';

const EventUpdatePage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [mapLocation, setMapLocation] = useState<google.maps.LatLng | null>(null);

  const router = useRouter();
  const params = useParams();
  const db = getFirestore();
  const auth = getAuth();

  // Ensure eventId is treated as a string
  const eventId = params.eventId as string;

  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        try {
          const eventDoc = await getDoc(doc(db, 'events', eventId));
          if (eventDoc.exists()) {
            const data = eventDoc.data();
            setName(data.name);
            setDescription(data.description);
            setDate(data.date);
            setLocation(data.location);
            setImagePath(data.imagePath || '');
            if (data.coordinates) {
              setMapLocation(new google.maps.LatLng(data.coordinates.lat, data.coordinates.lng));
            }
          } else {
            alert('Event not found');
          }
        } catch (error) {
          console.error('Error fetching event:', error);
        }
      };

      fetchEvent();
    }
  }, [eventId, db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && date && location) {
      try {
        await updateDoc(doc(db, 'events', eventId), {
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
        alert('Event updated successfully!');
        router.push('/'); // Navigate back to the home page or another page
      } catch (error) {
        console.error('Error updating event:', error);
      }
    } else {
      alert('Please fill out all required fields.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Update Event</h1>
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
          <button type="button" onClick={() => router.push('/mapsCreate')}>Update Location</button>
          <button type="submit">Update Event</button>
        </div>
      </form>
    </div>
  );
};

export default EventUpdatePage;
