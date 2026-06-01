import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getRestaurantById } from '../../api/restaurantApi';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import styles from './RestaurantDetailPage.module.css';

const buildAddressLine = (r) => {
  const street = [r.street, r.house_number].filter(Boolean).join(' ');
  const city = [r.postal_code, r.city].filter(Boolean).join(' ');
  return [street, city].filter(Boolean).join(', ');
};

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

  const imageUrl = restaurant.image_path
    ? /^https?:\/\//i.test(restaurant.image_path)
      ? restaurant.image_path
      : process.env.REACT_APP_API_URL
      ? `${process.env.REACT_APP_API_URL}/images/${restaurant.image_path}`
      : null
    : null;

  return (
    <div className={styles.detail}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={restaurant.restaurant_name} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>Brak zdjęcia</div>
        )}
      </div>
      <h1 className={styles.name}>{restaurant.restaurant_name}</h1>
      <p className={styles.address}>{buildAddressLine(restaurant)}</p>
      <p className={styles.description}>{restaurant.description}</p>

      <div className={styles.infoGrid}>

        {restaurant.open_from && restaurant.open_to && (
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🕐</span>
            <div>
              <p className={styles.infoLabel}>Godziny otwarcia</p>
              <p className={styles.infoValue}>
                {restaurant.open_from} — {restaurant.open_to}
              </p>
            </div>
          </div>
        )}

        {restaurant.delivery_from && restaurant.delivery_to && (
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🚴</span>
            <div>
              <p className={styles.infoLabel}>Godziny dowozu</p>
              <p className={styles.infoValue}>
                {restaurant.delivery_from} — {restaurant.delivery_to}
              </p>
            </div>
          </div>
        )}

        {restaurant.delivery_price != null && (
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>💰</span>
            <div>
              <p className={styles.infoLabel}>Dostawa</p>
              <p className={styles.infoValue}>
                {Number(restaurant.delivery_price) === 0
                  ? 'Bezpłatna'
                  : `${Number(restaurant.delivery_price).toFixed(2)} zł`}
                {restaurant.free_delivery_from && (
                  <span className={styles.infoSub}>
                    {' '}(gratis od{' '}
                    {Number(restaurant.free_delivery_from).toFixed(2)} zł)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {restaurant.min_order_amount != null &&
          Number(restaurant.min_order_amount) > 0 && (
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🛒</span>
            <div>
              <p className={styles.infoLabel}>Min. zamówienie</p>
              <p className={styles.infoValue}>
                {Number(restaurant.min_order_amount).toFixed(2)} zł
              </p>
            </div>
          </div>
        )}

        {restaurant.pickup_available === 1 && (
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🏃</span>
            <div>
              <p className={styles.infoLabel}>Odbiór osobisty</p>
              <p className={styles.infoValue}>Dostępny</p>
            </div>
          </div>
        )}

      </div>

      <div className={styles.actions}>
        <Button onClick={() => navigate(`/restaurants/${restaurant.id_restaurant}/menu`)}>
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
