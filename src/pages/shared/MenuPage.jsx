import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMenuByRestaurant, getMenuCategories } from '../../api/menuApi';
import { getRestaurantById } from '../../api/restaurantApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import MenuItemCard from '../../components/MenuItemCard';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import styles from './MenuPage.module.css';

const MenuPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const canOrder = user?.role === 'USER';

  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [restaurantRes, menuRes, categoriesRes] = await Promise.all([
        getRestaurantById(id),
        getMenuByRestaurant(id),
        getMenuCategories(),
      ]);
      setRestaurant(restaurantRes.data);
      setItems(Array.isArray(menuRes.data) ? menuRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch {
      setError('Nie udało się załadować menu. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const grouped = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const key = item.category_id ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    const orderedCategories = [...categories];
    orderedCategories.sort((a, b) => a.id - b.id);
    return orderedCategories
      .filter((cat) => map.has(cat.id))
      .map((cat) => ({ id: cat.id, name: cat.category_name, items: map.get(cat.id) }))
      .concat(
        [...map.keys()]
          .filter((k) => !orderedCategories.find((c) => c.id === k))
          .map((k) => ({ id: k, name: 'Inne', items: map.get(k) }))
      );
  }, [items, categories]);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className={styles.errorBox}>
        <p>{error}</p>
        <Button onClick={fetchAll}>Spróbuj ponownie</Button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {restaurant?.restaurant_name || 'Menu'}
          </h1>
          {(restaurant?.street || restaurant?.city) && (
            <p className={styles.address}>
              {[restaurant.street, restaurant.house_number]
                .filter(Boolean).join(' ')}
              {restaurant.city ? `, ${restaurant.city}` : ''}
            </p>
          )}
        </div>
        <Link to={`/restaurants/${id}`} className={styles.backLink}>
          ← Wróć do restauracji
        </Link>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Ta restauracja nie ma jeszcze menu.</p>
      ) : (
        grouped.map((group) => (
          <section key={group.id} className={styles.section}>
            <h2 className={styles.categoryTitle}>{group.name}</h2>
            <div className={styles.list}>
              {group.items.map((item) => (
                <MenuItemCard
                  key={item.id_menu_product}
                  menuItem={item}
                  onAddToCart={
                    canOrder
                      ? (menuItem) =>
                          addItem(
                            menuItem,
                            restaurant.id_restaurant,
                            restaurant.restaurant_name
                          )
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default MenuPage;
