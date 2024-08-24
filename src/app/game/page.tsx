"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/firebaseClient/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import './Game.module.css';
import { useAuth } from "@/context/AuthContext";

interface GamePageProps {
  title: string;
  eventId: string;
  isSubmitted: boolean;
}

const GamePage: React.FC<GamePageProps> = ({ title, eventId, isSubmitted }) => {
  const [isSubmittedState, setIsSubmittedState] = useState(isSubmitted);
  const [quizQuestion, setQuizQuestion] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkIfEventCompleted();
  }, []);

  const checkIfEventCompleted = async () => {
    try {
      const eventDocRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventDocRef);

      if (eventDoc.exists() && eventDoc.data()?.completedEmail) {
        setIsLoading(false);
        alert('This event was already completed.');
        router.push('/');
      } else {
        fetchQuizDetails();
      }
    } catch (e) {
      console.error('Error checking event completion:', e);
      setIsLoading(false);
      alert('Error occurred. Please try again later.');
    }
  };

  const fetchQuizDetails = async () => {
    try {
      const eventDocRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventDocRef);

      setQuizQuestion(eventDoc.data()?.quizz || null);
      setCorrectAnswer(eventDoc.data()?.answer || null);
      setIsLoading(false);
    } catch (e) {
      console.error('Error fetching quiz details:', e);
      setIsLoading(false);
    }
  };

  const confirmParticipation = async (answeredCorrectly = true) => {
    try {
      const user = currentUser;
      const userId = user?.uid || '';
      const userEmail = user?.email || '';

      if (userId && userEmail) {
        const eventDocRef = doc(db, 'events', eventId);
        await setDoc(eventDocRef, {
          userId: userId,
          Completed: answeredCorrectly,
          completedEmail: userEmail,
          timestamp: new Date(),
        }, { merge: true });

        setIsSubmittedState(true);
        alert(answeredCorrectly ? 'Correct answer! You have successfully joined this event!' : 'You have successfully joined this event!');
        router.push('/');
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
    } else if (userAnswer.trim().toLowerCase() === correctAnswer?.trim().toLowerCase()) {
      confirmParticipation(true);
    } else {
      alert('Incorrect answer, please try again.');
    }
  };

  return (
    <div className="container">
      <h1 className="title">{title}</h1>
      {isLoading ? (
        <div className="loader">Loading...</div>
      ) : (
        <div className="content">
          <p className="quizQuestion">{quizQuestion || 'No quiz available for this event. Confirm your participation by pressing Submit.'}</p>
          {quizQuestion && (
            <input
              type="text"
              placeholder="Your Answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="input"
            />
          )}
          <button onClick={submitQuiz} className="submitButton">
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
