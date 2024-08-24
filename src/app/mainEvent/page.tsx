'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/firebaseClient/firebase'; // Import initialized Firebase instances
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface MainEventPageProps {
  eventId: string;
  isSubmitted: boolean;
}

const MainEventPage: React.FC<MainEventPageProps> = ({ eventId, isSubmitted }) => {
  const [isJoined, setIsJoined] = useState(isSubmitted);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const checkJoinStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('admins', 'array-contains', user.email));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          if (doc.id === eventId) {
            setIsJoined(true);
          }
        });
      }
    };

    checkJoinStatus();
  }, [eventId]);

  const handleJoinClick = async () => {
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);

      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        const admins = eventData?.admins || [];

        if (!admins.includes(user.email || '')) {
          admins.push(user.email || '');
          await updateDoc(eventRef, { admins });

          setIsJoined(true);
        }
      }
    }
  };

  const handleRedirect = () => {
    router.push(`/event/${eventId}`); // Navigate to the event page
  };

  return (
    <div>
      <h1>Event Details</h1>
      <button onClick={handleJoinClick} disabled={isJoined}>
        {isJoined ? 'Joined' : 'Join Event'}
      </button>
      <button onClick={handleRedirect}>
        Go to Event Page
      </button>
    </div>
  );
};

export default MainEventPage;
