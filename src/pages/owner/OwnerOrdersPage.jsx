import React, { useEffect, useState } from 'react';
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

  const changeStatus = async (orderId, statusName) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, statusName);
      setOrders((prev) =>
        prev.map((o) => (o.id_order === orderId ? { ...o, status_name: statusName } : o))
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

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Brak zamówień do wyświetlenia.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => {
            const meta = STATUS_META[order.status_name] || {
              label: order.status_name,
              className: 'statusNew',
            };
            const busy = updatingId === order.id_order;
            const isNew = order.status_name === 'NEW';
            const isProgress = order.status_name === 'IN_PROGRESS';
            return (
              <div key={order.id_order} className={styles.card}>
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

                <div className={styles.footer}>
                  <span>Razem</span>
                  <span className={styles.total}>{formatPrice(order.total_price)}</span>
                </div>

                {(isNew || isProgress) && (
                  <div className={styles.actions}>
                    {isNew && (
                      <Button
                        disabled={busy}
                        onClick={() => changeStatus(order.id_order, 'IN_PROGRESS')}
                      >
                        Przyjmij
                      </Button>
                    )}
                    {isProgress && (
                      <Button
                        disabled={busy}
                        onClick={() => changeStatus(order.id_order, 'COMPLETED')}
                      >
                        Zrealizuj
                      </Button>
                    )}
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
