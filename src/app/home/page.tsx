"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/firebaseClient/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import './HomePage.css';
import EventContainer from "../../components/EventContainer";
import type { EventProps } from "../../../types";
import { Menu } from "@mui/icons-material";


export default function Home() {

    const router = useRouter();
    const { user } = useAuth();

    const [events, setEvents] = useState<EventProps[]>([]);

    useEffect(() => {
        if (!user) {
            router.push("/auth");
        }

        const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
            const data = snapshot.docs.map((doc: any): EventProps => ({ id: doc.id, ...doc.data() }));
            console.log(data);
            setEvents(data);
        })

        return () => unsubscribe();
    }, [router, user])

    return (
        <main className="pageContainer">
            <div className="page-wrapper"> 
                <span className="menu-icon"> <Menu /> </span>
                <header className="page-title">
                Events
                </header>
            </div>
            <div className="events-container">
                {events.map((event) => <EventContainer key={event.id} props={event} />)}
                {events.length === 0 && <p>No events</p>}
            </div>

        </main>
        
    )
}