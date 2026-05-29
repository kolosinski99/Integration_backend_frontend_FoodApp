import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMenuByRestaurant, deleteMenuItem, getMenuCategories } from '../../api/menuApi';
import { getMyRestaurant } from '../../api/restaurantApi';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import SuccessBanner from '../../components/SuccessBanner';
import { formatPrice } from '../../utils/format';
import styles from './MenuManagementPage.module.css';

const MenuManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNoRestaurant, setHasNoRestaurant] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setHasNoRestaurant(false);
    try {
      const restaurantRes = await getMyRestaurant();
      const ownRestaurantId = restaurantRes.data?.id_restaurant;
      if (!ownRestaurantId) {
        setHasNoRestaurant(true);
        return;
      }
      const [menuRes, categoriesRes] = await Promise.all([
        getMenuByRestaurant(ownRestaurantId),
        getMenuCategories(),
      ]);
      setItems(Array.isArray(menuRes.data) ? menuRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setHasNoRestaurant(true);
      } else {
        setError('Nie udało się załadować menu. Spróbuj ponownie.');
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

  const getCategoryName = (categoryId) =>
    categories.find((c) => c.id === categoryId)?.category_name || '—';

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć danie ${item.product_name}? Tej operacji nie można cofnąć.`
    );
    if (!confirmed) return;
    setDeletingId(item.id_menu_product);
    try {
      await deleteMenuItem(item.id_menu_product);
      setItems((prev) => prev.filter((i) => i.id_menu_product !== item.id_menu_product));
    } catch {
      setError('Nie udało się usunąć dania. Spróbuj ponownie.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <Spinner />;

  if (hasNoRestaurant) {
    return (
      <div className={styles.emptyState}>
        <p>Najpierw dodaj restaurację, aby zarządzać menu.</p>
        <Button onClick={() => navigate('/owner/dashboard')}>Przejdź do panelu</Button>
      </div>
    );
  }

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
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Zarządzanie menu</h1>
        <Button onClick={() => navigate('/owner/menu/new')}>Dodaj nowe danie</Button>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nie masz jeszcze żadnych dań w menu.</p>
          <Button onClick={() => navigate('/owner/menu/new')}>Dodaj pierwsze danie</Button>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nazwa</th>
                <th>Kategoria</th>
                <th>Cena</th>
                <th>Opis</th>
                <th className={styles.actionsCol}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id_menu_product}>
                  <td className={styles.name}>{item.product_name}</td>
                  <td>{getCategoryName(item.category_id)}</td>
                  <td className={styles.price}>{formatPrice(item.price)}</td>
                  <td className={styles.description}>{item.product_description}</td>
                  <td className={styles.actions}>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/owner/menu/edit/${item.id_menu_product}`)}
                    >
                      Edytuj
                    </Button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id_menu_product}
                    >
                      {deletingId === item.id_menu_product ? 'Usuwanie...' : 'Usuń'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MenuManagementPage;
