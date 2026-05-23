import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getRestaurantById } from '../../api/restaurantApi';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import styles from './RestaurantDetailPage.module.css';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const response = await getRestaurantById(id);
        if (active) setRestaurant(response.data);
      } catch (err) {
        if (!active) return;
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError('Nie udało się załadować restauracji. Spróbuj ponownie.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) return <Spinner />;

  if (notFound) {
    return (
      <div className={styles.errorBox}>
        <p>Restauracja nie istnieje.</p>
        <Link to="/restaurants">Wróć do listy</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        <p>{error}</p>
        <Link to="/restaurants">Wróć do listy</Link>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className={styles.detail}>
      <div className={styles.imageWrapper}>
        {restaurant.imageUrl ? (
          <img src={restaurant.imageUrl} alt={restaurant.name} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>Brak zdjęcia</div>
        )}
      </div>
      <h1 className={styles.name}>{restaurant.name}</h1>
      <p className={styles.address}>{restaurant.address}</p>
      <p className={styles.phone}>Tel: {restaurant.phone}</p>
      <p className={styles.description}>{restaurant.description}</p>
      <div className={styles.actions}>
        <Button onClick={() => navigate(`/restaurants/${restaurant.id}/menu`)}>
          Zobacz menu
        </Button>
        <Link to="/restaurants" className={styles.backLink}>
          Wróć do listy
        </Link>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
