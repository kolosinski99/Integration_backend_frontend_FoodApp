import React, { useEffect, useMemo, useState } from 'react';
import { getRestaurantOrders, updateOrderStatus } from '../../api/orderApi';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import { formatPrice } from '../../utils/format';
import styles from './OwnerOrdersPage.module.css';

const STATUS_META = {
  NEW: { label: 'Nowe', className: 'statusNew' },
  IN_PROGRESS: { label: 'W trakcie realizacji', className: 'statusProgress' },
  COMPLETED: { label: 'Zrealizowane', className: 'statusCompleted' },
  CANCELLED: { label: 'Anulowane', className: 'statusCancelled' },
};

const formatDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const OwnerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [estimatedMinutes, setEstimatedMinutes] = useState({});

  const tabCounts = useMemo(() => ({
    active: orders.filter((o) =>
      o.status_name === 'NEW' || o.status_name === 'IN_PROGRESS'
    ).length,
    completed: orders.filter((o) => o.status_name === 'COMPLETED').length,
    cancelled: orders.filter((o) => o.status_name === 'CANCELLED').length,
  }), [orders]);

  const displayed = useMemo(() => {
    if (activeTab === 'active')
      return orders.filter((o) =>
        o.status_name === 'NEW' || o.status_name === 'IN_PROGRESS'
      );
    if (activeTab === 'completed')
      return orders.filter((o) => o.status_name === 'COMPLETED');
    return orders.filter((o) => o.status_name === 'CANCELLED');
  }, [orders, activeTab]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getRestaurantOrders();
      const list = Array.isArray(res.data) ? res.data : [];
      list.sort((a, b) => new Date(b.create_date) - new Date(a.create_date));
      setOrders(list);
    } catch {
      setError('Nie udało się załadować zamówień. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const changeStatus = async (orderId, statusName, minutes = null) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, statusName, minutes);
      setOrders((prev) =>
        prev.map((o) =>
          o.id_order === orderId
            ? {
                ...o,
                status_name: res.data.status_name,
                estimated_minutes: res.data.estimated_minutes,
              }
            : o
        )
      );
    } catch {
      setError('Nie udało się zmienić statusu zamówienia.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className={styles.errorBox}>
        <p>{error}</p>
        <Button onClick={fetchOrders}>Spróbuj ponownie</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Zamówienia</h1>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'active' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Aktywne ({tabCounts.active})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'completed' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Zrealizowane ({tabCounts.completed})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'cancelled' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Anulowane ({tabCounts.cancelled})
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Brak zamówień w tej kategorii.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {displayed.map((order) => {
            const meta = STATUS_META[order.status_name] || {
              label: order.status_name,
              className: 'statusNew',
            };
            const busy = updatingId === order.id_order;
            const isNew = order.status_name === 'NEW';
            const isProgress = order.status_name === 'IN_PROGRESS';
            return (
              <div
                key={order.id_order}
                className={`${styles.card} ${isNew ? styles.cardNew : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.orderNumber}>#{order.id_order}</span>
                    <span className={styles.restaurant}>{order.restaurant_name}</span>
                  </div>
                  <span className={`${styles.badge} ${styles[meta.className]}`}>
                    {meta.label}
                  </span>
                </div>

                <div className={styles.date}>{formatDate(order.create_date)}</div>

                <ul className={styles.items}>
                  {order.items.map((it) => (
                    <li key={it.menu_product_id}>
                      <span>
                        {it.product_name} × {it.quantity}
                      </span>
                      <span>{formatPrice(it.item_price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>

                {order.client_comment && (
                  <p className={styles.comment}>Uwagi klienta: {order.client_comment}</p>
                )}

                {order.estimated_minutes && (
                  <p className={styles.estimatedTime}>
                    Szacowany czas realizacji: {order.estimated_minutes} min
                  </p>
                )}

                <div className={styles.footer}>
                  <span>Razem</span>
                  <span className={styles.total}>{formatPrice(order.total_price)}</span>
                </div>

                {isNew && (
                  <div className={styles.estimateRow}>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      step="5"
                      placeholder="Czas (np. 30)"
                      value={estimatedMinutes[order.id_order] || ''}
                      onChange={e =>
                        setEstimatedMinutes(prev => ({
                          ...prev,
                          [order.id_order]: e.target.value,
                        }))
                      }
                      className={styles.estimateInput}
                    />
                    <span className={styles.estimateUnit}>min</span>
                    <Button
                      disabled={busy}
                      onClick={() =>
                        changeStatus(
                          order.id_order,
                          'IN_PROGRESS',
                          Number(estimatedMinutes[order.id_order]) || null
                        )
                      }
                    >
                      Przyjmij
                    </Button>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      disabled={busy}
                      onClick={() => changeStatus(order.id_order, 'CANCELLED')}
                    >
                      Anuluj
                    </button>
                  </div>
                )}

                {isProgress && (
                  <div className={styles.actions}>
                    <Button
                      disabled={busy}
                      onClick={() => changeStatus(order.id_order, 'COMPLETED')}
                    >
                      Zrealizuj
                    </Button>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      disabled={busy}
                      onClick={() => changeStatus(order.id_order, 'CANCELLED')}
                    >
                      Anuluj
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerOrdersPage;
