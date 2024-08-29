"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, storageRef } from "@/firebaseClient/firebase";
import { collection, onSnapshot, query, where, doc, deleteDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import styles from './Events_created.module.css';
import EventContainer from "../../components/EventContainer";
import { EventProps } from "../../../types";
import { LinearProgress, Box } from "@mui/material";

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

    const handleUpdateEventClick = (eventId: string) => {
        router.push(`/updateEvent?eventId=${eventId}`);
    };

    const handleDeleteEventClick = async (eventId: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteDoc(doc(db, "events", eventId));
                setEvents((prevEvents) => prevEvents.filter(event => event.id !== eventId));
            } catch (error) {
                console.error("Error deleting event: ", error);
            }
        }
    };

    return (
        <main className={styles.pageContainer}>
            <button className={styles.returnButton} onClick={() => router.push('/')}>Home</button>
            <div className={styles.pageWrapper}>
                <header className={styles.pageTitle}>My Created Events</header>
            </div>
            {
                isLoading ? 
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box> :
                <div className={styles.eventsContainer}>
                    {events.length > 0 ? (
                        events.map((event) => (
                            <div key={event.id} className={styles.eventContainer}>
                                <EventContainer 
                                    props={event} 
                                    onClick={() => router.push(`/event/${event.id}`)} 
                                />
                                <div className={styles.buttonGroup}>
                                    <button
                                        className={styles.viewEventButton}
                                        onClick={() => handleUpdateEventClick(event.id)}
                                    >
                                        Update Event
                                    </button>
                                    <button
                                        className={styles.viewEventButton}
                                        onClick={() => handleDeleteEventClick(event.id)}
                                    >
                                        Delete Event
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No events</p>
                    )}
                </div>
            }
        </main>
    );
}
