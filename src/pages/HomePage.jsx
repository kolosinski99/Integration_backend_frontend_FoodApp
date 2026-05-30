import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isUser = user?.role === 'USER';
  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>
        Witaj, {user?.firstName || user?.name || user?.email}!
      </h1>
      <p className={styles.sub}>
        {isUser && 'Przeglądaj restauracje i składaj zamówienia.'}
        {isOwner && 'Zarządzaj swoją restauracją i realizuj zamówienia.'}
        {isAdmin && 'Zarządzaj platformą i zatwierdzaj restauracje.'}
      </p>

      <div className={styles.actions}>
        {isUser && (
          <>
            <Button onClick={() => navigate('/restaurants')}>
              Przeglądaj restauracje
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/orders')}
            >
              Moje zamówienia
            </Button>
          </>
        )}
        {isOwner && (
          <>
            <Button onClick={() => navigate('/owner/dashboard')}>
              Mój panel
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/owner/orders')}
            >
              Zamówienia
            </Button>
          </>
        )}
        {isAdmin && (
          <Button onClick={() => navigate('/admin/dashboard')}>
            Panel admina
          </Button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
