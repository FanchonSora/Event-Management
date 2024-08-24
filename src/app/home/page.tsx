"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/firebaseClient/firebase";
import { collection, onSnapshot } from "firebase/firestore";

import type { EventProps } from "../../../types";

export default function Home() {

    const router = useRouter();
    const { user } = useAuth();

    const [events, setEvents] = useState<EventProps[]>([]);

    useEffect(() => {
        if (!user) {
            router.push("/auth");
        }
        
        const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
            const data = snapshot.docs.map((doc : any) : EventProps => ({ id: doc.id, ...doc.data() }));
            console.log(data);
            setEvents(data);
        })

        return () => unsubscribe();
    }, [router, user])

    return (
        <main>
            <h1>Sign In</h1>
        </main>
    )
}