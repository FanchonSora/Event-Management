"use client";

import {
    signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/firebaseClient/firebase";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function Auth() {
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    useEffect(() => {
        if (user) {
            console.log(user);
        }
    }, [])

    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
        }
    }

    return (
        <main>
            <h1>Sign In Form</h1>
            <form className="flex flex-col w-[50%]" onSubmit={(e) => { e.preventDefault(); signIn() }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    className="text-black email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    className="text-black"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input onClick={signIn} value="Sign in" type="submit"/>
            </form>
        </main>
    )
}