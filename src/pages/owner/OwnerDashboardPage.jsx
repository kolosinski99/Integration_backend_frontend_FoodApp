import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyRestaurant } from '../../api/restaurantApi';
import { getRestaurantOrders } from '../../api/orderApi';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import SuccessBanner from '../../components/SuccessBanner';
import styles from './OwnerDashboardPage.module.css';

const buildAddressLine = (r) => {
  const street = [r.street, r.house_number].filter(Boolean).join(' ');
  const city = [r.postal_code, r.city].filter(Boolean).join(' ');
  return [street, city].filter(Boolean).join(', ');
};

const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  const { user } = useAuth();
  const ownerName = user?.name || user?.firstName || '';

  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNoRestaurant, setHasNoRestaurant] = useState(false);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

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
    getRestaurantOrders()
      .then((res) => {
        const active = (res.data || []).filter(
          (o) => o.status_name === 'NEW' || o.status_name === 'IN_PROGRESS'
        ).length;
        setActiveOrderCount(active);
      })
      .catch(() => {});
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

  const imageUrl = restaurant?.image_path
    ? /^https?:\/\//i.test(restaurant.image_path)
      ? restaurant.image_path
      : process.env.REACT_APP_API_URL
      ? `${process.env.REACT_APP_API_URL}/images/${restaurant.image_path}`
      : null
    : null;

  return (
    <div>
      <SuccessBanner message={successMessage} />
      <h1 className={styles.title}>
        {ownerName ? `Witaj, ${ownerName}!` : 'Mój panel'}
      </h1>
      {hasNoRestaurant ? (
        <div className={styles.emptyState}>
          <p>Nie masz jeszcze restauracji.</p>
          <Button onClick={() => navigate('/owner/restaurant/new')}>
            Dodaj restaurację
          </Button>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.imageWrapper}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={restaurant.restaurant_name}
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>Brak zdjęcia</div>
            )}
          </div>
          <h2 className={styles.name}>{restaurant.restaurant_name}</h2>
          <p className={styles.address}>{buildAddressLine(restaurant)}</p>
          <p className={styles.description}>{restaurant.description}</p>
          <div className={styles.cardActions}>
            <Button onClick={() => navigate('/owner/restaurant/edit')}>
              Edytuj dane restauracji
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/owner/orders')}
            >
              Zamówienia
              {activeOrderCount > 0 && (
                <span className={styles.orderBadge}>{activeOrderCount}</span>
              )}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/owner/report')}>
              Raport sprzedaży
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
