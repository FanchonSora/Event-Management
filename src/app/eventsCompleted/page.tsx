"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, storageRef } from "@/firebaseClient/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import styles from './Events_completed.module.css'; // CSS module for styling
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
            query(collection(db, "events"), where("completedEmail", "==", user.email)),
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

    return (
        <main className={styles.pageContainer}>
            <button className={styles.returnButton} onClick={() => router.push('/')}>Home</button>
            <div className={styles.pageWrapper}>
                <header className={styles.pageTitle}>My Completed Events</header>
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
                                    onClick={() => router.push(`/updateEvent?eventId=${event.id}`)} 
                                />
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
