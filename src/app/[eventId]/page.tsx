'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styles from './Main_event.module.css';
import { db } from '@/firebaseClient/firebase';
import { LinearProgress, Box } from '@mui/material';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import LocationOn from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';

const MainEventPage: React.FC = () => {
  const [event, setEvent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { eventId } = useParams();
  const router = useRouter();
  const auth = getAuth();

  const safeEventId = Array.isArray(eventId) ? eventId[0] : eventId;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!safeEventId) {
          setError("Event ID is missing.");
          return;
        }
        const docRef = doc(db, 'events', safeEventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Event data:", docSnap.data());
          setEvent(docSnap.data());
          const eventData = docSnap.data();
          const users = eventData.users || [];
          if (currentUserEmail) {
            setHasJoined(users.includes(currentUserEmail));
          }
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
  }, [safeEventId, currentUserEmail]);

  const handleJoinEvent = async () => {
    if (!safeEventId || !currentUserEmail) return;

    try {
      const eventRef = doc(db, 'events', safeEventId);
      const docSnap = await getDoc(eventRef);

      if (!docSnap.exists()) {
        setError("Event not found.");
        return;
      }

      const eventData = docSnap.data();
      const users = eventData.users || [];

      if (users.includes(currentUserEmail)) {
        alert("You have already joined this event.");
        return;
      }

      await updateDoc(eventRef, {
        users: arrayUnion(currentUserEmail),
        joined: increment(1),
      });
      setHasJoined(true);
      router.push(`/${safeEventId}/game`); // Navigate to the game page
    } catch (error) {
      console.error("Error joining event:", error);
      setError("Failed to join the event.");
    }
  };

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
      <button
        className={styles.returnButton}
        onClick={() => router.back()}
      >
        Home
      </button>
      <h1 className={styles.title}>{event.name}</h1>
      {event.imagePath && <img src={event.imagePath} alt={event.name} className={styles.image} />}
      <div className={styles.details}>
        <div className={styles.dateTime}>
          <QueryBuilderIcon className={styles.icons} />
          {new Date(event.date).toLocaleString()}
        </div>
        <div className={styles.location}>
          <LocationOn className={styles.icons} />
          {event.location}
        </div>
        <div className={styles.description}>
          <DescriptionIcon className={styles.icons} />
          {event.description}
        </div>
        <div className={styles.rule}>
          <DescriptionIcon className={styles.icons} />
          {event.rule}
        </div>
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
      {!hasJoined && (
        <button
          className={styles.joinButton}
          onClick={handleJoinEvent}
        >
          Join Event
        </button>
      )}
    </div>
  );
};

export default MainEventPage;
