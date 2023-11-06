import "./App.css";
import { Routes, Route } from "react-router-dom";
import Auth from "./auth/auth";
import React from "react";
import Home from "./components/Home";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContextProvider } from './auth/AuthContext';

function App() {
  return (
    <GoogleOAuthProvider clientId="798667058109-kkgti290ee89mq9q1331rqmop7u1v4fd.apps.googleusercontent.com">
      <AuthContextProvider>
          <div className="App">
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/auth" element={<Auth />} />
            </Routes>
          </div>
      </AuthContextProvider>
    </GoogleOAuthProvider>
  );
}

export default App;