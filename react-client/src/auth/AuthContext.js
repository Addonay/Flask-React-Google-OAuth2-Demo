import React, { createContext, useState, useEffect } from 'react';
import { useGoogleLogin } from "@react-oauth/google";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  async function getUserInfo(codeResponse) {
    var response = await fetch("/google_login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: codeResponse.code }),
      credentials: 'include',  // Include cookies
    });
    return await response.json();
  }

  async function getProtected() {
    try {
      var response = await fetch("/protected", {
        method: "GET",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 401) {
        // Access token expired, refresh it
        await fetch("/refresh_token", {
          method: "POST",
          credentials: 'include',
        });
        // Retry the /protected request
        response = await fetch("/protected", {
          method: "GET",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  }

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      var loginDetails = await getUserInfo(codeResponse);
      setLoggedIn(true);
      setUser(loginDetails.user);
    },
  });

  const handleLogout = async () => {
    await fetch("/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    setLoggedIn(false);
    setUser({});
  };

  // Fetch user info from /protected route when component mounts
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const protectedInfo = await getProtected();
        setUser(protectedInfo.logged_in_as);
        setLoggedIn(true);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      checkLoggedIn();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, user, googleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};