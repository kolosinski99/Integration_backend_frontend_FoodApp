import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Witaj, {user?.firstName || user?.email}!</h1>
      <p>Zalogowano jako: <strong>{user?.role}</strong></p>
      <Button onClick={handleLogout}>Wyloguj</Button>
    </div>
  );
};

export default HomePage;
