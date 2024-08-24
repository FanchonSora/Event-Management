"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, storageRef } from "@/firebaseClient/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseClient/firebase";

import type { EventProps } from "../../../types";
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
        <main>
            <h1>Sign In</h1>
            <button onClick={handleSignOut}>Sign Out</button>
        </main>
    )
}