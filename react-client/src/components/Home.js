import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
// import UserAvatar from './userAvatar';
import { Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
  const { loggedIn, user, handleLogout } = useContext(AuthContext);

  return (
    <Container>
      <Typography>Hello My name is Addonay! </Typography>
      
      {!loggedIn ? (
        <Link to="/auth">Login</Link>
      ) : (
        <div>
          {/* <UserAvatar userName={user.name} onClick={handleLogout}></UserAvatar> */}
          <div>
            <p>id: {user.id}</p>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <img src={user.profile} alt="Profile" />
          </div>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      )}
    </Container>
  );
}