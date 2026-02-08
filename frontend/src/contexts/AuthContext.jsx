import React, { useContext, useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signupWithEmail(email, password, name) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });

        // Sync user with backend
        const token = await result.user.getIdToken();
        await axios.post(`${API_BASE_URL}/api/auth/sync`, {
            name: name
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return result;
    }

    async function loginWithEmail(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // Sync user with backend
            const token = await result.user.getIdToken();
            await axios.post(`${API_BASE_URL}/api/auth/sync`, {
                name: result.user.displayName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return result;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        signupWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
