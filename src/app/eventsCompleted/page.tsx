"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/firebaseClient/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import styles from "./Events_completed.module.css";
import EventContainer from "../../components/EventContainer";

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

        const q = query(collection(db, "events"), where("completedEmail", "array-contains", userEmail));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCompletedEvents(eventsData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router, user]);

    const handleViewEventClick = (eventId: string) => {
        router.push(`/mainEvent?eventId=${eventId}`);
    };

    return (
        <main className={styles.pageContainer}>
            <button className={styles.returnButton} onClick={() => router.push('/')}>
                Home
            </button>
            <div className={styles.pageWrapper}>
                <header className={styles.pageTitle}>My Completed Events</header>
            </div>
            <div className={styles.eventsContainer}>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    completedEvents.length > 0 ? (
                        completedEvents.map((event) => (
                            <div key={event.id} className={styles.eventContainer}>
                                <EventContainer props={event} onClick={function (): void {
                                    throw new Error("Function not implemented.");
                                } } />
                                <button
                                    className={styles.viewEventButton}
                                    onClick={() => handleViewEventClick(event.id)}
                                >
                                    View Event
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No completed events</p>
                    )
                )}
            </div>
        </main>
    );
}
