"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseClient/firebase";
import { useAuth } from "@/context/AuthContext";
import "./SignUpPage.css";

export default function SignUpPage() {
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

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
    }, [user, router]);

    const signUp = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("User signed up successfully");
            router.push("/home");
        } catch (error: any) {
            setError(error.message);
            console.error("Error signing up:", error);
        }
    };

    return (
        <main className="pageContainer">
            <div className="transparent-container">
                <h1 className="appName">Create Account</h1>
                <p className="appDescription">Sign up with your email and password</p>
                {error && <p className="errorMessage">{error}</p>}
                <form className="sign-up-form" onSubmit={(e) => { e.preventDefault(); signUp(); }}>
                    <TextField
                        value={email}
                        className="text-field"
                        onChange={(e) => setEmail(e.target.value)}
                        size="medium"
                        label="Email"
                        InputProps={styling}
                        sx={sx}
                    />
                    <TextField
                        value={password}
                        className="text-field"
                        label="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        InputProps={styling}
                        sx={sx}
                    />
                    <input onClick={signUp} value="Sign up" type="submit" className="sign-up-button" />
                </form>
            </div>
        </main>
    );
}
