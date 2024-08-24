"use client";

import { createContext, useEffect, useContext, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '@/firebaseClient/firebase';

const AuthContext = createContext({} as any);

export const AuthProvider = ({ children } : React.PropsWithChildren) => {
    const [user, setUser] = useState(() => {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            console.log(user);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
    
};

export const useAuth = () => {
    return useContext(AuthContext);
};