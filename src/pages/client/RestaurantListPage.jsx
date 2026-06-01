import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants, getRestaurantCategories } from '../../api/restaurantApi';
import RestaurantCard from '../../components/RestaurantCard';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import styles from './RestaurantListPage.module.css';

const RestaurantListPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [restaurantsRes, categoriesRes] = await Promise.all([
        getRestaurants(),
        getRestaurantCategories(),
      ]);
      const all = Array.isArray(restaurantsRes.data) ? restaurantsRes.data : [];
      // Backend powinien zwracać tylko is_approved = 1 dla roli USER.
      // Filtr po stronie frontendu jako zabezpieczenie dodatkowe.
      setRestaurants(all.filter((r) => r.is_approved === 1));
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch {
      setError('Nie udało się załadować restauracji. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => {
      m[c.id_restaurant_category] = c.category_name;
    });
    return m;
  }, [categories]);

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const phrase = search.trim().toLowerCase();
    if (!phrase) return restaurants;
    return restaurants.filter((r) => {
      const name = (r.restaurant_name || '').toLowerCase();
      const city = (r.city || '').toLowerCase();
      const street = (r.street || '').toLowerCase();
      return name.includes(phrase) || city.includes(phrase) || street.includes(phrase);
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
              key={restaurant.id_restaurant}
              restaurant={restaurant}
              onClick={() => navigate(`/restaurants/${restaurant.id_restaurant}`)}
              categoryName={categoryMap[restaurant.restaurant_category_id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantListPage;
