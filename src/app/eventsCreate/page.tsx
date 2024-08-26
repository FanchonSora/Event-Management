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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && date && location) {
      try {
        const admins = adminEmail ? [adminEmail] : [];

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
          quizz,
          answer,
          admins,
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
      <button className={styles.returnButton} onClick={() => router.push('/home')}>
        Home
      </button>
      
      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form} id="eventForm">
          <div className={styles.createElements}>
            <label>Event Name:</label>
            <input
              className={styles.inputField}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.createElements}>
            <label>Description:</label>
            <textarea
              className={styles.inputField}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className={styles.createElements}>
            <label>Date:</label>
            <input
              className={styles.inputField}
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.createElements}>
            <label>Location:</label>
            <input
              className={styles.inputField}
              type="text"
              value={location}
              readOnly
              required
            />
          </div>

          <div className={styles.createElements}>
            <label>Image Path:</label>
            <input
              className={styles.inputField}
              type="text"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
            />
          </div>

          <div className={styles.createElements}>
            <label>Quiz Question:</label>
            <input
              className={styles.inputField}
              type="text"
              value={quizz}
              onChange={(e) => setQuizz(e.target.value)}
            />
          </div>

          <div className={styles.createElements}>
            <label>Answer:</label>
            <input
              className={styles.inputField}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>

          <div className={styles.createElements}>
            <label>Admin Email:</label>
            <input
              className={styles.inputField}
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>

          <div className={styles.createEventButtonContainer}>
            <button type="submit" className={styles.submitButton}>
              Create Event
            </button>
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
