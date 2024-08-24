"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, storageRef } from "@/firebaseClient/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import styles from './Events_created.module.css'; // CSS module for styling
import EventContainer from "../../components/EventContainer";
import { EventProps } from "../../../types";
import { Button } from "@mui/material";

export default function UserCreatedEvents() {
    const router = useRouter();
    const { user } = useAuth();
    const [events, setEvents] = useState<EventProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/auth");
            return;
        }

        const unsubscribe = onSnapshot(
            query(collection(db, "events"), where("admins", "array-contains", user.email)),
            async (snapshot) => {
                const data = snapshot.docs.map(async (doc: any): Promise<EventProps> => {
                    const current = doc.data();
                    if (current.imagePath && current.imagePath !== "") {
                        const imageRef = ref(storageRef, doc.data().imagePath);
                        const imageUrl = await getDownloadURL(imageRef);
                        current.imagePath = imageUrl;
                    }
                    return ({ id: doc.id, ...current });
                });

                setIsLoading(true);
                Promise.all(data).then((data) => {
                    setEvents(data);
                    setIsLoading(false);
                });
            }
        );

        return () => unsubscribe();
    }, [router, user]);

    const handleViewEventClick = (eventId: string) => {
        router.push(`/mainEvent?eventId=${eventId}`);
    };

    return (
        <main className={styles.pageContainer}>
            <button className={styles.returnButton} onClick={() => router.push('/')}>Home</button>
            <div className={styles.pageWrapper}>
                <header className={styles.pageTitle}>My Created Events</header>
            </div>
            <div className={styles.eventsContainer}>
                {events.map((event) => (
                    <div key={event.id} className={styles.eventContainer}>
                        <EventContainer props={event} />
                        <button
                            className={styles.viewEventButton}
                            onClick={() => handleViewEventClick(event.id)}
                        >
                            View Event
                        </button>
                    </div>
                ))}
                {events.length === 0 && <p>No events</p>}
            </div>
        </main>
    );
}
