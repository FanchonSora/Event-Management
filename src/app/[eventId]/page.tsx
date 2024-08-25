'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import styles from './Main_event.module.css';
import { db } from '@/firebaseClient/firebase';
import { LinearProgress, Box } from '@mui/material';

const MainEventPage: React.FC = () => {
  const [event, setEvent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Event data:", docSnap.data());
          setEvent(docSnap.data());
        } else {
          console.log("No such event!");
          setError("Event not found.");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Error fetching event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, []);

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  if (loading) {
    return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div className={styles.mainEventContainer}>
      <h1 className={styles.title}>{event.name}</h1>
      {event.imagePath && <img src={event.imagePath} alt={event.name} className={styles.image} />}
      <div className={styles.details}>
        <div className={styles.dateTime}>Date: {new Date(event.date).toLocaleString()}</div>
        <div className={styles.location}>Location: {event.location}</div>
        <div className={styles.description}>Description: {event.description}</div>
      </div>
      {event.coordinates && (
        <div className={styles.mapContainer}>
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
            <GoogleMap
              mapContainerStyle={{ height: '100%', width: '100%' }}
              center={event.coordinates}
              zoom={14}
              onLoad={handleMapLoad}
            >
              <Marker position={event.coordinates} />
            </GoogleMap>
          </LoadScript>
        </div>
      )}
      <button className={styles.joinButton} onClick={() => router.push('/join-event')}>
        Join Event
      </button>
    </div>
  );
};

export default MainEventPage;
