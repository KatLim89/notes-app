import { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in
        const idToken = await user.getIdToken();
        sendTokenToBackend(idToken);
        setCurrentUser(user);
      } else {
        // No user is signed in
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  const sendTokenToBackend = async (idToken) => {
    try {
      // Send token to backend for verification
      const response = await axios.post(
        `https://99b6929c-56a5-444e-96dd-f7076230e811-00-1fjk0a40maqdf.sisko.replit.dev/verify-token`,
        { token: idToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Token verified by backend:", response.data);
    } catch (error) {
      console.error("Error sending token to backend:", error);
    }
  };

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
