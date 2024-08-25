"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/firebaseClient/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import styles from "./Events_completed.module.css";
import EventContainer from "../../components/EventContainer";
import { LinearProgress, Box } from "@mui/material";

export default function CompletedEventsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [completedEvents, setCompletedEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/auth");
            return;
        }

        const userEmail = user.email;

        if (!userEmail) {
            console.error('User email is not available');
            return;
        }

        const q = query(collection(db, "events"), where("completedEmail", "array-contains", userEmail));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setCompletedEvents(eventsData);
            setIsLoading(false);
        }, (error) => {
            console.error('Error fetching events:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router, user]);

    const handleUpdateEventClick = (eventId: string) => {
        router.push(`/updateEvent?eventId=${eventId}`);
    };

    return (
        <main className={styles.pageContainer}>
            <button className={styles.returnButton} onClick={() => router.push('/')}>
                Home
            </button>
            <header className={styles.pageTitle}>My Completed Events</header>
            {
                isLoading ? 
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box> :
                <div className={styles.eventsContainer}>
                    {completedEvents.length > 0 ? (
                        completedEvents.map((event) => (
                            <div key={event.id} className={styles.eventContainer}>
                                <EventContainer 
                                    props={event} 
                                    onClick={() => handleUpdateEventClick(event.id)} // Provide onClick prop
                                />
                                <button
                                    className={styles.viewEventButton}
                                    onClick={() => handleUpdateEventClick(event.id)}
                                >
                                    Update Event
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No completed events</p>
                    )}
                </div>
            }
        </main>
    );
}
