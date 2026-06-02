import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminRestaurants,
  approveRestaurant,
  rejectRestaurant,
  getAdminRestaurantDetail,
  getAdminOrders,
} from '../../api/adminApi';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import styles from './AdminDashboardPage.module.css';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

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

  const handleViewDetail = async (id) => {
    setSelectedId(id);
    setLoadingDetail(true);
    setDetail(null);
    try {
      const res = await getAdminRestaurantDetail(id);
      setDetail(res.data);
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'orders' && orders.length === 0) {
      setOrdersLoading(true);
      getAdminOrders()
        .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
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
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Panel admina</h1>
        <Button onClick={() => navigate('/admin/restaurants/new')}>
          + Dodaj restaurację
        </Button>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          Oczekujące na zatwierdzenie ({pending.length})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'approved' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('approved')}
        >
          Zatwierdzone ({approved.length})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          Wszystkie zamówienia
        </button>
      </div>

      {activeTab !== 'orders' &&
        (list.length === 0 ? (
        <p className={styles.empty}>
          {activeTab === 'pending'
            ? 'Brak restauracji oczekujących na zatwierdzenie. Wszystko sprawdzone!'
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
                      <button
                        type="button"
                        className={styles.detailButton}
                        onClick={() => handleViewDetail(r.id_restaurant)}
                      >
                        Szczegóły
                      </button>
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
      ))}

      {activeTab === 'orders' && (
        <div className={styles.ordersSection}>
          {ordersLoading ? (
            <Spinner />
          ) : orders.length === 0 ? (
            <p className={styles.empty}>Brak zamówień w systemie.</p>
          ) : (
            orders.map((order) => {
              const STATUS_COLORS = {
                NEW: styles.badgePending,
                IN_PROGRESS: styles.badgeProgress,
                COMPLETED: styles.badgeApproved,
                CANCELLED: styles.badgeCancelled,
              };
              const STATUS_LABELS = {
                NEW: 'Nowe',
                IN_PROGRESS: 'W realizacji',
                COMPLETED: 'Zrealizowane',
                CANCELLED: 'Anulowane',
              };
              const isExpanded = expandedOrder === order.id_order;
              const d = new Date(order.create_date);
              const dateStr = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

              return (
                <div key={order.id_order} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>#{order.id_order}</span>
                      <span className={styles.orderRestaurant}>
                        {order.restaurant_name}
                      </span>
                      <span
                        className={`${styles.badge} ${STATUS_COLORS[order.status_name] || ''}`}
                      >
                        {STATUS_LABELS[order.status_name] || order.status_name}
                      </span>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={styles.orderDate}>{dateStr}</span>
                      <span className={styles.orderTotal}>
                        {Number(order.total_price).toFixed(2)} zł
                      </span>
                      <button
                        type="button"
                        className={styles.expandBtn}
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.id_order)
                        }
                      >
                        {isExpanded ? 'Zwiń ▲' : 'Szczegóły ▼'}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className={styles.orderDetails}>
                      {order.items && order.items.length > 0 ? (
                        <ul className={styles.orderItems}>
                          {order.items.map((it, idx) => (
                            <li key={idx}>
                              <span>
                                {it.product_name} × {it.quantity}
                              </span>
                              <span>
                                {Number(it.item_price * it.quantity).toFixed(2)} zł
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.noItems}>Brak pozycji.</p>
                      )}
                      {order.client_comment && (
                        <p className={styles.comment}>
                          Uwagi: {order.client_comment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedId && (
        <div className={styles.modalOverlay} onClick={handleCloseDetail}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Szczegóły restauracji</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={handleCloseDetail}
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <Spinner />
            ) : detail ? (
              <div className={styles.modalContent}>
                {/* Zdjęcie */}
                {detail.image_path && (
                  <img
                    src={`http://localhost:8080/uploads/${detail.image_path}`}
                    alt={detail.restaurant_name}
                    className={styles.modalImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                {/* Dane restauracji */}
                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Dane restauracji</h3>
                  <div className={styles.modalGrid}>
                    <div>
                      <p className={styles.modalLabel}>Nazwa</p>
                      <p className={styles.modalValue}>{detail.restaurant_name}</p>
                    </div>
                    <div>
                      <p className={styles.modalLabel}>Kategoria</p>
                      <p className={styles.modalValue}>{detail.category_name || '—'}</p>
                    </div>
                    <div>
                      <p className={styles.modalLabel}>Adres</p>
                      <p className={styles.modalValue}>
                        {detail.street} {detail.house_number}, {detail.postal_code}{' '}
                        {detail.city}
                      </p>
                    </div>
                    <div>
                      <p className={styles.modalLabel}>Opis</p>
                      <p className={styles.modalValue}>{detail.description || '—'}</p>
                    </div>
                  </div>
                </section>

                {/* Dane właściciela */}
                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Dane właściciela</h3>
                  <div className={styles.modalGrid}>
                    <div>
                      <p className={styles.modalLabel}>Imię i nazwisko</p>
                      <p className={styles.modalValue}>
                        {[detail.owner_name, detail.owner_surname]
                          .filter(Boolean)
                          .join(' ') || '—'}
                      </p>
                    </div>
                    <div>
                      <p className={styles.modalLabel}>Email</p>
                      <p className={styles.modalValue}>{detail.owner_login}</p>
                    </div>
                  </div>
                </section>

                {/* Menu */}
                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>
                    Menu ({detail.menu?.length || 0} dań)
                  </h3>
                  {!detail.menu || detail.menu.length === 0 ? (
                    <p className={styles.modalEmpty}>Brak dań w menu.</p>
                  ) : (
                    <ul className={styles.menuList}>
                      {detail.menu.map((item) => (
                        <li key={item.id_menu_product} className={styles.menuItem}>
                          <div className={styles.menuItemTop}>
                            <span className={styles.menuItemName}>
                              {item.product_name}
                            </span>
                            <span className={styles.menuItemPrice}>
                              {Number(item.price).toFixed(2)} zł
                            </span>
                          </div>
                          {item.product_description && (
                            <p className={styles.menuItemDesc}>
                              {item.product_description}
                            </p>
                          )}
                          <div className={styles.menuItemMeta}>
                            {item.spice_level > 0 && (
                              <span>{'🌶️'.repeat(item.spice_level)}</span>
                            )}
                            {item.allergens && (
                              <span className={styles.menuItemAllergens}>
                                Alergeny: {item.allergens}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Przyciski akcji */}
                {detail.is_approved === 0 && (
                  <div className={styles.modalActions}>
                    <Button
                      onClick={async () => {
                        await handleApprove(detail.id_restaurant);
                        handleCloseDetail();
                      }}
                    >
                      Zatwierdź restaurację
                    </Button>
                    <button
                      type="button"
                      className={styles.revertButton}
                      onClick={handleCloseDetail}
                    >
                      Zamknij
                    </button>
                  </div>
                )}
                {detail.is_approved === 1 && (
                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      className={styles.revertButton}
                      onClick={async () => {
                        await handleReject(detail.id_restaurant);
                        handleCloseDetail();
                      }}
                    >
                      Cofnij zatwierdzenie
                    </button>
                    <button
                      type="button"
                      className={styles.closeButton}
                      onClick={handleCloseDetail}
                    >
                      Zamknij
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className={styles.modalEmpty}>
                Nie udało się załadować szczegółów.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
