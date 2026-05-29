import React, { useEffect, useMemo, useState } from 'react';
import { getAdminRestaurants, approveRestaurant, rejectRestaurant } from '../../api/adminApi';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import styles from './AdminDashboardPage.module.css';

const AdminDashboardPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminRestaurants();
      setRestaurants(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Nie udało się załadować restauracji. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const pending = useMemo(
    () => restaurants.filter((r) => r.is_approved === 0),
    [restaurants]
  );
  const approved = useMemo(
    () => restaurants.filter((r) => r.is_approved === 1),
    [restaurants]
  );

  const handleApprove = async (id) => {
    setUpdatingId(id);
    try {
      await approveRestaurant(id);
      setRestaurants((prev) =>
        prev.map((r) => (r.id_restaurant === id ? { ...r, is_approved: 1 } : r))
      );
    } catch {
      setError('Nie udało się zatwierdzić restauracji.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id) => {
    setUpdatingId(id);
    try {
      await rejectRestaurant(id);
      setRestaurants((prev) =>
        prev.map((r) => (r.id_restaurant === id ? { ...r, is_approved: 0 } : r))
      );
    } catch {
      setError('Nie udało się cofnąć zatwierdzenia.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className={styles.errorBox}>
        <p>{error}</p>
        <Button onClick={fetchRestaurants}>Spróbuj ponownie</Button>
      </div>
    );
  }

  const list = activeTab === 'pending' ? pending : approved;

  return (
    <div>
      <h1 className={styles.title}>Panel admina</h1>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Oczekujące ({pending.length})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'approved' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Zatwierdzone ({approved.length})
        </button>
      </div>

      {list.length === 0 ? (
        <p className={styles.empty}>
          {activeTab === 'pending'
            ? 'Brak restauracji oczekujących na zatwierdzenie.'
            : 'Brak zatwierdzonych restauracji.'}
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nazwa</th>
                <th>Adres</th>
                <th>Status</th>
                <th className={styles.actionsCol}>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const busy = updatingId === r.id_restaurant;
                return (
                  <tr key={r.id_restaurant}>
                    <td className={styles.name}>{r.restaurant_name}</td>
                    <td>
                      {r.street} {r.house_number}, {r.city}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          r.is_approved === 1 ? styles.badgeApproved : styles.badgePending
                        }`}
                      >
                        {r.is_approved === 1 ? 'Zatwierdzona' : 'Oczekuje'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      {r.is_approved === 0 ? (
                        <Button disabled={busy} onClick={() => handleApprove(r.id_restaurant)}>
                          Zatwierdź
                        </Button>
                      ) : (
                        <button
                          type="button"
                          className={styles.revertButton}
                          disabled={busy}
                          onClick={() => handleReject(r.id_restaurant)}
                        >
                          Cofnij
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
