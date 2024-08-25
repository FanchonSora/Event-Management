'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '@/firebaseClient/firebase'; // Import initialized Firebase instances
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';

const MainEventPage: React.FC = () => {
  const router = useRouter();
  const eventId = router.query.eventId;
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (typeof eventId !== 'string') {
      router.push('/');
    }

    const checkJoinStatus = async () => {
      const { user } = useAuth(); // Get user from AuthContext
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
      const eventRef = doc(db, 'events', typeof eventId === 'string' ? eventId : '');
      const eventDoc = await getDoc(eventRef);

      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        const participants = eventData?.participants || [];

        if (!participants.includes(user.email)) {
          participants.push(user.email || '');
          await updateDoc(eventRef, { participants });

          setIsJoined(true);
        }
      }
    }
  };

  return (
    <div>
      <button onClick={handleJoinClick} disabled={isJoined}>
        {isJoined ? 'Joined' : 'Join Event'}
      </button>

    </div>
  );
};

export default MainEventPage;
