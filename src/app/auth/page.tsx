"use client";

import './LoginPage.css';
import { BorderAll, BorderColor, Person } from "@mui/icons-material";
import {
    signInWithEmailAndPassword,
} from "firebase/auth";
import { colors, TextField } from '@mui/material';

import { auth } from "@/firebaseClient/firebase";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function Auth() {
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const styling = { style: { borderRadius: "20px", color: "white", border: "white" } };
    const sx = { 
        '& .MuiInputBase-root': {
            '& fieldset': {
                borderWidth: '2px',
                BorderColor: 'white',
            },
            '&.Mui-focused fieldset': {
                borderWidth: '2px',
                BorderColor: 'white',

            }
        }       
    }

    useEffect(() => {
        if (user) {
            router.push("/home");
        }
    }, [])

    const signIn = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, email, password);
            console.log(user);
            router.push("/home");
        } catch (error) {
            console.error(error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            const res = await signInWithPopup(auth, new GoogleAuthProvider())
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
                    <TextField
                        value={email}
                        className="text-field"
                        onChange={(e) => setEmail(e.target.value)}
                        size='medium'
                        label="Email"
                        InputProps={styling}
                        sx={sx}
                    />
        
                    {/* <Person /> */}
                    <TextField
                        value={password}
                        className="text-field"
                        label="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={styling}

                        sx={sx}
                    />
                    <input onClick={signIn} value="Sign in" type="submit" className="sign-in-button" />
                    <div className="icon-container"> 
                        <img src="https://img.icons8.com/ios/452/google-logo.png" alt="google" className="google-icon hover:cursor-pointer" onClick={signInWithGoogle} />
                        <img src="https://img.icons8.com/ios/452/facebook-new.png" alt="facebook" className="facebook-icon hover:cursor-pointer" />
                    </div>
                </form>
            </div>
        </main>
    );
}
