import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyRestaurant } from '../../api/restaurantApi';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import SuccessBanner from '../../components/SuccessBanner';
import styles from './OwnerDashboardPage.module.css';

const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNoRestaurant, setHasNoRestaurant] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setHasNoRestaurant(false);
    try {
      const response = await getMyRestaurant();
      if (!response.data || Object.keys(response.data).length === 0) {
        setHasNoRestaurant(true);
      } else {
        setRestaurant(response.data);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setHasNoRestaurant(true);
      } else {
        setError('Nie udało się załadować danych restauracji. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage, navigate, location.pathname]);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className={styles.errorBox}>
        <p>{error}</p>
        <Button onClick={fetchData}>Spróbuj ponownie</Button>
      </div>
    );
  }

  return (
    <div>
      <SuccessBanner message={successMessage} />
      <h1 className={styles.title}>Mój panel</h1>
      {hasNoRestaurant ? (
        <div className={styles.emptyState}>
          <p>Nie masz jeszcze restauracji.</p>
          <Button onClick={() => navigate('/owner/restaurant/new')}>
            Dodaj restaurację
          </Button>
        </div>
      ) : (
        <div className={styles.card}>
          <h2 className={styles.name}>{restaurant.name}</h2>
          <p className={styles.address}>{restaurant.address}</p>
          <p className={styles.phone}>Tel: {restaurant.phone}</p>
          <p className={styles.description}>{restaurant.description}</p>
          <Button onClick={() => navigate('/owner/restaurant/edit')}>
            Edytuj dane restauracji
          </Button>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
