import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyOrders } from '../../api/orderApi';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';
import SuccessBanner from '../../components/SuccessBanner';
import { formatPrice } from '../../utils/format';
import styles from './OrderHistoryPage.module.css';

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

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyOrders();
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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage, navigate, location.pathname]);

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
      <SuccessBanner message={successMessage} />
      <h1 className={styles.title}>Moje zamówienia</h1>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nie masz jeszcze żadnych zamówień.</p>
          <Button onClick={() => navigate('/restaurants')}>Przeglądaj restauracje</Button>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => {
            const meta = STATUS_META[order.status_name] || {
              label: order.status_name,
              className: 'statusNew',
            };
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
                  <p className={styles.comment}>Uwagi: {order.client_comment}</p>
                )}

                <div className={styles.footer}>
                  <span>Razem</span>
                  <span className={styles.total}>{formatPrice(order.total_price)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
