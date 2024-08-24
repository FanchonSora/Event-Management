"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, storageRef } from "@/firebaseClient/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import './HomePage.css';
import EventContainer from "../../components/EventContainer";
import { ref, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseClient/firebase";

import type { EventProps } from "../../../types";
import { Menu, Notifications, EventAvailable, CheckCircle, AddCircle } from "@mui/icons-material";

export default function Home() {
    const router = useRouter();
    const { user } = useAuth();
    const [events, setEvents] = useState<EventProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSignOut = () => {
        localStorage.removeItem("user");
        signOut(auth);
        router.push("/auth");
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        if (!user) {
            router.push("/auth");
        }

        const unsubscribe = onSnapshot(collection(db, "events"), async (snapshot) => {
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
        });

        return () => unsubscribe();
    }, [router, user]);

    const handleViewEventClick = (eventId: string) => {
        router.push(`/mainEvent?eventId=${eventId}`);
    };

    return (
        <main className="pageContainer">
            <div className="page-wrapper">
                <span className="menu-icon" onClick={toggleMenu}><Menu /></span>
                <header className="page-title">Events</header>
            </div>
            {menuOpen && (
                <div className="menu-container">
                    <span className="menu-item"><Notifications /> Notifications</span>
                    <span className="menu-item"><EventAvailable /> My Created Events</span>
                    <span className="menu-item"><CheckCircle /> Completed Events</span>
                    <span className="menu-item" onClick={() => router.push('/eventsCreate')}>
                        <AddCircle /> Create Event
                    </span>
                    <span className="menu-item" onClick={handleSignOut}>Sign Out</span>
                </div>
            )}
            <div className="events-container">
                {events.map((event) => (
                    <div key={event.id} className="event-container">
                        <EventContainer props={event} />
                        <button
                            className="view-event-button"
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
