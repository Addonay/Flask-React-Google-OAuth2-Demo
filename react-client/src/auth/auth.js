import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import IconButton from "@mui/material/IconButton";
import GoogleIcon from "@mui/icons-material/Google";

export default function Auth() {
  const { loggedIn, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    await googleLogin();
    navigate('/');
  };

  return (
    <>
      {!loggedIn && (
        <IconButton
          color="primary"
          aria-label="add to shopping cart"
          onClick={handleLogin}
        >
          <GoogleIcon fontSize="large" />
        </IconButton>
      )}
    </>
  );
}