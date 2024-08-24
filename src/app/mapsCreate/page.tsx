'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import styles from './Map.module.css';

const MapCreatePage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLng | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const router = useRouter();

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setSelectedLocation(event.latLng);
    }
  };

  const handlePlaceSelected = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const location = place.geometry.location;
        setSelectedLocation(location);
        if (mapRef.current) {
          mapRef.current.panTo(location);
        }
      }
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      const lat = selectedLocation.lat();
      const lng = selectedLocation.lng();
      router.push(`/eventsCreate?lat=${lat}&lng=${lng}`);
    }
  };

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          const userLocation = new google.maps.LatLng(latitude, longitude);
          mapRef.current.panTo(userLocation);
          setSelectedLocation(userLocation);
        }
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className={styles.mapContainer}>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string} libraries={['places']}>
        <Autocomplete
          onLoad={(autocomplete) => autocompleteRef.current = autocomplete}
          onPlaceChanged={handlePlaceSelected}
        >
          <input
            type="text"
            placeholder="Search for a location"
            className={styles.searchInput}
          />
        </Autocomplete>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={selectedLocation || { lat: 37.7749, lng: -122.4194 }} // Default center
          zoom={14}
          onClick={handleMapClick}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
      </LoadScript>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={handleGetUserLocation}>Get User's Location</button>
        <button className={styles.button} onClick={handleConfirmLocation}>Confirm Location</button>
      </div>
    </div>
  );
};

export default MapCreatePage;
