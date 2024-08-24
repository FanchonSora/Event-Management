'use client';

import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { db, auth } from '@/firebaseClient/firebase'; // Import initialized Firebase instances
import { getFirestore, doc, updateDoc, addDoc, query, where, getDocs, collection, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 

interface MapPageProps {
  eventLocation: string;
  eventId: string;
}

const MapPage: React.FC<MapPageProps> = ({ eventLocation, eventId }) => {
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng | null>(null);
  const [eventPosition, setEventPosition] = useState<google.maps.LatLng | null>(parseLocation(eventLocation));
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [showMap, setShowMap] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const checkEventLocation = async () => {
      const eventRef = doc(db, "events", eventId);
      const eventDoc = await getDoc(eventRef);

      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        console.log('Event data:', eventData); // Verify data structure
        const location = eventData?.location;

        if (location === "Online") {
          setShowMap(false);
        } else {
          setEventPosition(parseLocation(location)); // Update event position if needed
        }
      }
    };

    checkEventLocation();
  }, [db, eventId]);

  useEffect(() => {
    const handleLocationUpdate = async () => {
      const { coords } = await getCurrentPosition();
      const newPosition = new google.maps.LatLng(coords.latitude, coords.longitude);
      setCurrentPosition(newPosition);

      const userId = auth.currentUser?.uid;
      if (userId) {
        const locationRef = collection(db, "location");
        const q = query(locationRef, where("uid", "==", userId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          await updateDoc(doc(db, "location", snapshot.docs[0].id), {
            latitude: coords.latitude,
            longitude: coords.longitude
          });
        } else {
          await addDoc(locationRef, {
            uid: userId,
            latitude: coords.latitude,
            longitude: coords.longitude
          });
        }
      }
    };

    handleLocationUpdate();
    const locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        setCurrentPosition(newPosition);
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(locationWatchId);
  }, [db, auth]);

  useEffect(() => {
    if (currentPosition && eventPosition) {
      const directionsService = new google.maps.DirectionsService();
      const request: google.maps.DirectionsRequest = {
        origin: currentPosition,
        destination: eventPosition,
        travelMode: google.maps.TravelMode.WALKING
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      });
    }
  }, [currentPosition, eventPosition]);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true
      });
    });
  };

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const handleDirectionsButtonClick = () => {
    if (eventPosition) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${eventPosition.lat()},${eventPosition.lng()}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  if (!showMap) {
    return <div>No map available for online events.</div>;
  }

  return (
    <div>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_FIREBASE_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ height: '100vh', width: '100%' }}
        center={currentPosition || eventPosition || { lat: 37.4223, lng: -122.0848 }}
        zoom={14}
        onLoad={handleMapLoad}
      >
        {currentPosition && <Marker position={currentPosition} />}
        {eventPosition && <Marker position={eventPosition} />}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
      <button onClick={handleDirectionsButtonClick}>
        Get Directions to Event
      </button>
      </LoadScript>
    </div>
  );
};

const parseLocation = (location: string | undefined): google.maps.LatLng | null => {
  if (!location || typeof location !== 'string') {
    console.error('Invalid location:', location);
    return null;
  }

  const parts = location.split(',');
  if (parts.length === 2) {
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) {
      return new google.maps.LatLng(lat, lng);
    }
  }

  console.error('Invalid location format:', location);
  return null;
};

export default MapPage;
