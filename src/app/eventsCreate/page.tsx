'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from './Event_creation.module.css';

const EventCreatePage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [mapLocation, setMapLocation] = useState<google.maps.LatLng | null>(null);
  const [quizz, setQuizz] = useState('');
  const [answer, setAnswer] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const mapRef = useRef<google.maps.Map | null>(null);
  const router = useRouter();
  const db = getFirestore();
  const auth = getAuth();

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setMapLocation(event.latLng);
      setLocation(`${event.latLng.lat()}, ${event.latLng.lng()}`);
    }
  };

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          const userLocation = new google.maps.LatLng(latitude, longitude);
          mapRef.current.panTo(userLocation);
          setMapLocation(userLocation);
          setLocation(`${latitude}, ${longitude}`);
        }
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const sendNotification = async (eventId: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        title: 'New Event Created',
        description: `A new event with ID ${eventId} has been created.`,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && date && location) {
      try {
        const admins = adminEmail ? [adminEmail] : [];
        
        // Add the new event to the 'events' collection
        const eventDocRef = await addDoc(collection(db, 'events'), {
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
          quizz,
          answer,
          admins,
        });

        // Send notification
        await sendNotification(eventDocRef.id);

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
      <button className={styles.returnButton} onClick={() => router.push('/home')}>
        Home
      </button>
      <div className={styles.content}>
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
              readOnly
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
          <label>
            Quiz Question:
            <input
              type="text"
              value={quizz}
              onChange={(e) => setQuizz(e.target.value)}
            />
          </label>
          <label>
            Answer:
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>
          <label>
            Admin Email:
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </label>
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.submitButton}>Create Event</button>
          </div>
        </form>
        <div className={styles.mapSection}>
          <div className={styles.mapContainer}>
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
              <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={mapLocation || { lat: 37.7749, lng: -122.4194 }} // Default center
                zoom={14}
                onClick={handleMapClick}
                onLoad={(map) => { mapRef.current = map; }}
              >
                {mapLocation && <Marker position={mapLocation} />}
              </GoogleMap>
            </LoadScript>
          </div>
          <div className={styles.mapControls}>
            <button className={styles.button} onClick={handleGetUserLocation}>Get User's Location</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreatePage;
