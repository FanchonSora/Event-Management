"use client";

import './LoginPage.css';
import { Person } from "@mui/icons-material";
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
            console.error(error);
        }
    };

    return (
        <main className="pageContainer">
            <div className="transparent-container">
                <h1 className="appName">Sign In Form</h1>
                <p className="appDescription">Login to your account</p>
                <form className="sign-in-form" onSubmit={(e) => { e.preventDefault(); signIn(); }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        className="text-black email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
        
                    {/* <Person /> */}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        className="text-black"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input onClick={signIn} value="Sign in" type="submit" className="sign-in-button" />
                    <div className="icon-container"> 
                        <img src="https://img.icons8.com/ios/452/google-logo.png" alt="google" className="google-icon" />
                        <img src="https://img.icons8.com/ios/452/facebook-new.png" alt="facebook" className="facebook-icon" />
                    </div>
                </form>
            </div>
        </main>
    );
}
