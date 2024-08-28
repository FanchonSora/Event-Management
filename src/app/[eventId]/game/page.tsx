'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MyButton from '@/components/MyButton'; // Adjust import path
import styles from './Game.module.css';

const GamePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const router = useRouter();
  const { eventId } = useParams();
  const firestore = getFirestore();
  const auth = getAuth();

  // Ensure eventId is a string
  const safeEventId = Array.isArray(eventId) ? eventId[0] : eventId;

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        if (!safeEventId) {
          alert('Event ID is missing.');
          router.push('/'); // Redirect to home or a different page if eventId is missing
          return;
        }
        const eventDoc = await getDoc(doc(firestore, 'events', safeEventId));
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          setQuizQuestion(data?.quizz || null);
          setCorrectAnswer(data?.answer || null);
          setIsLoading(false);
        } else {
          alert('Quiz details not found.');
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Error fetching quiz details:', e);
        setIsLoading(false);
      }
    };

    fetchQuizDetails();
  }, [safeEventId]);

  const confirmParticipation = async (answeredCorrectly = true) => {
    try {
      const user = auth.currentUser;
      const userId = user?.uid || '';
      const userEmail = user?.email || '';

      if (userId && userEmail) {
        await setDoc(
          doc(firestore, 'events', safeEventId),
          {
            userId,
            Completed: answeredCorrectly,
            completedEmail: arrayUnion(userEmail),
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );

        setIsSubmitted(true);
        alert(
          answeredCorrectly
            ? 'Correct answer! You have successfully joined this event!'
            : 'You have successfully joined this event!'
        );
        router.back();
      } else {
        alert('User not logged in. Please try again.');
      }
    } catch (e) {
      console.error('Failed to confirm participation:', e);
      alert('Failed to join event. Please try again.');
    }
  };

  const submitQuiz = () => {
    if (!quizQuestion) {
      confirmParticipation();
    } else if (
      userAnswer.trim().toLowerCase() === correctAnswer?.trim().toLowerCase()
    ) {
      confirmParticipation(true);
    } else {
      alert('Incorrect answer, please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.returnButton}
        onClick={() => router.back()} // Navigate back to the previous page
      >
        Return
      </button>
      <h1 className={styles.title}>Game</h1>
      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.content}>
          <p className={styles.quizQuestion}>
            {quizQuestion ||
              'No quiz available for this event. Confirm your participation by pressing Submit.'}
          </p>
          {quizQuestion && (
            <input
              type="text"
              placeholder="Your Answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={styles.input}
            />
          )}
          <MyButton buttonText="Submit" onClick={submitQuiz} className={styles.button} />
        </div>
      )}
    </div>
  );
};

export default GamePage;
