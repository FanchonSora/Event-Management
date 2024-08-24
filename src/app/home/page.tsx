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
import { Menu } from "@mui/icons-material";

import { sign } from "crypto";

export default function Home() {

    const router = useRouter();
    const { user } = useAuth();

    const [events, setEvents] = useState<EventProps[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = () => {
        localStorage.removeItem("user");
        signOut(auth);
        router.push("/auth");
    };

    useEffect(() => {
        if (!user) {
            router.push("/auth");
        }
        
        const unsubscribe = onSnapshot(collection(db, "events"), async (snapshot) => {
            const data = snapshot.docs.map(async (doc : any) : Promise<EventProps> => {
                const current = doc.data()
                console.log(current)
                if (current.imagePath && current.imagePath !== "") {
                    const imageRef = ref(storageRef, doc.data().imagePath);
                    const imageUrl = await getDownloadURL(imageRef);
                    current.imagePath = imageUrl;
                }

                return ({ id: doc.id, ...current})
            });
            
            setIsLoading(true);
            Promise.all(data).then((data) => {
                setEvents(data);
                setIsLoading(false);
                console.log(data);
            });
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

            <button onClick={handleSignOut}>Sign Out</button>
        </main>
        
    )
}