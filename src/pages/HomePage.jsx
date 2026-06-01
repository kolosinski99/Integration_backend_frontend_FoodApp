import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './HomePage.module.css';

const NAV_CARDS = {
  USER: [
    {
      title: 'Restauracje',
      description: 'Przeglądaj dostępne restauracje i zamawiaj ulubione dania',
      icon: '🍽️',
      path: '/restaurants',
      primary: true,
    },
    {
      title: 'Moje zamówienia',
      description: 'Sprawdź historię i status swoich zamówień',
      icon: '📋',
      path: '/orders',
      primary: false,
    },
    {
      title: 'Mój profil',
      description: 'Zarządzaj danymi osobowymi i adresem dostawy',
      icon: '👤',
      path: '/profile',
      primary: false,
    },
  ],
  OWNER: [
    {
      title: 'Moja restauracja',
      description: 'Zarządzaj danymi i zdjęciem swojej restauracji',
      icon: '🏪',
      path: '/owner/dashboard',
      primary: true,
    },
    {
      title: 'Zamówienia',
      description: 'Przyjmuj i realizuj zamówienia od klientów',
      icon: '📦',
      path: '/owner/orders',
      primary: true,
    },
    {
      title: 'Menu',
      description: 'Dodawaj i edytuj dania w menu restauracji',
      icon: '🍕',
      path: '/owner/menu',
      primary: false,
    },
  ],
  ADMIN: [
    {
      title: 'Panel admina',
      description: 'Zarządzaj restauracjami i zatwierdzaj nowe wnioski',
      icon: '⚙️',
      path: '/admin/dashboard',
      primary: true,
    },
  ],
};

const ROLE_GREETINGS = {
  USER: 'Gotowy na smaczne zamówienie?',
  OWNER: 'Zarządzaj swoją restauracją',
  ADMIN: 'Panel administracyjny',
};

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'USER';
  const cards = NAV_CARDS[role] || NAV_CARDS.USER;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heading}>
          Witaj, {user?.firstName || user?.name || user?.email}!
        </h1>
        <p className={styles.sub}>{ROLE_GREETINGS[role]}</p>
      </div>

      <div className={styles.grid}>
        {cards.map((card) => (
          <button
            key={card.path}
            type="button"
            className={`${styles.card} ${card.primary ? styles.cardPrimary : styles.cardSecondary}`}
            onClick={() => navigate(card.path)}
          >
            <span className={styles.cardIcon}>{card.icon}</span>
            <h2 className={styles.cardTitle}>{card.title}</h2>
            <p className={styles.cardDesc}>{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
