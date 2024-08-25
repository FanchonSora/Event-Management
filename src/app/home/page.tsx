"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, storageRef } from "@/firebaseClient/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import './HomePage.css';
import EventContainer from "../../components/EventContainer";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseClient/firebase";
import type { EventProps } from "../../../types";
import { Menu, Notifications, EventAvailable, CheckCircle, AddCircle } from "@mui/icons-material";
import { LinearProgress, Box } from "@mui/material";

export default function Home() {
    const router = useRouter();
    const { user } = useAuth();
    const [events, setEvents] = useState<EventProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<{ title: string; description: string }[]>([]);

    const handleSignOut = () => {
        localStorage.removeItem("user");
        signOut(auth);
        router.push("/auth");
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleNotifications = () => {
        setNotificationsOpen(!notificationsOpen);
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
            
            Promise.all(data).then((data) => {
                setEvents(data);
                setIsLoading(() => {
                    console.log("Loaded")
                    return false;
                });
            });
        });

        return () => unsubscribe();
    }, [router, user]);

    useEffect(() => {
        // Example notification data, replace with actual notification fetching logic
        setNotifications([
            { title: "Event Reminder", description: "Don't forget about the upcoming event!" },
            { title: "New Event", description: "A new event has been created. Check it out!" }
        ]);
    }, []);

    const handleViewEventClick = (eventId: string) => {
        router.push(`/${eventId}`);
    };

    return (
        <main className="pageContainer">
            <div className="page-wrapper">
                <span className="menu-icon absolute" onClick={toggleMenu}><Menu /></span>
                <header className="page-title">Events</header>
            </div>
            {menuOpen && (
                <div className="menu-container">
                    <span className="menu-item" onClick={toggleNotifications}>
                        <Notifications /> Notifications
                    </span>
                    <span className="menu-item" onClick={() => router.push('/eventsCreated')}>
                        <EventAvailable /> My Created Events
                    </span>
                    <span className="menu-item" onClick={() => router.push('/eventsCompleted')}>
                        <CheckCircle /> Completed Events
                    </span>
                    <span className="menu-item" onClick={() => router.push('/eventsCreate')}>
                        <AddCircle /> Create Event
                    </span>
                    <span className="menu-item" onClick={handleSignOut}>Sign Out</span>
                </div>
            )}
            <div className={`notifications-container ${notificationsOpen ? 'active' : ''}`}>
                {notifications.map((notification, index) => (
                    <div key={index} className="notification-container">
                        <h3 className="notification-title">{notification.title}</h3>
                        <p className="notification-description">{notification.description}</p>
                    </div>
                ))}
            </div>
            {
                isLoading ? 

                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box> :

                <div className="events-container">
                    {events.map((event) => (
                        <div key={event.id} className="event-container-outer">
                            <EventContainer props={event} onClick={() => handleViewEventClick(event.id)} />
                        </div>
                    ))}
                    {events.length === 0 && <p>No events</p>}
                </div>
            }
        </main>
    );
}
