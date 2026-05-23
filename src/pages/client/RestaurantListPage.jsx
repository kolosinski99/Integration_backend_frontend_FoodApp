import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../api/restaurantApi';
import RestaurantCard from '../../components/RestaurantCard';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import styles from './RestaurantListPage.module.css';

const RestaurantListPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getRestaurants();
      setRestaurants(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError('Nie udało się załadować restauracji. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const phrase = search.trim().toLowerCase();
    if (!phrase) return restaurants;
    return restaurants.filter((r) => {
      const name = (r.name || '').toLowerCase();
      const address = (r.address || '').toLowerCase();
      return name.includes(phrase) || address.includes(phrase);
    });
  }, [restaurants, search]);

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
      <h1 className={styles.title}>Restauracje</h1>
      <input
        type="search"
        className={styles.search}
        placeholder="Szukaj restauracji..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {restaurants.length === 0 ? (
        <p className={styles.empty}>Brak dostępnych restauracji.</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>Brak wyników dla: {search}</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantListPage;
