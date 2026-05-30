import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder, getPaymentMethods } from '../../api/orderApi';
import Button from '../../components/Button';
import { formatPrice } from '../../utils/format';
import styles from './CartPage.module.css';

const POSTAL_CODE_REGEX = /^\d{2}-\d{3}$/;

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value || '');
const buildImageUrl = (imagePath) =>
  imagePath
    ? isAbsoluteUrl(imagePath)
      ? imagePath
      : `${process.env.REACT_APP_API_URL}/images/${imagePath}`
    : null;

const formatPostalCode = (raw) => {
  const digits = String(raw).replace(/\D/g, '').slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    restaurantId,
    restaurantName,
    totalPrice,
    isEmpty,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const savedAddresses = Array.isArray(user?.addresses) ? user.addresses : [];
  const hasSavedAddresses = savedAddresses.length > 0;

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [comment, setComment] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(
    hasSavedAddresses ? String(savedAddresses[0].id_address) : ''
  );
  const [addressForm, setAddressForm] = useState({
    street: '',
    houseNumber: '',
    apartmentNumber: '',
    postalCode: '',
    city: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let active = true;
    getPaymentMethods()
      .then((res) => {
        if (active) setPaymentMethods(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setPaymentMethods([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const addressErrors = useMemo(() => {
    if (hasSavedAddresses) return {};
    const next = {};
    if (!addressForm.street.trim()) next.street = 'Ulica jest wymagana.';
    else if (addressForm.street.trim().length < 3)
      next.street = 'Ulica musi mieć co najmniej 3 znaki.';
    if (!addressForm.houseNumber.trim()) next.houseNumber = 'Numer domu jest wymagany.';
    if (!addressForm.postalCode.trim()) next.postalCode = 'Kod pocztowy jest wymagany.';
    else if (!POSTAL_CODE_REGEX.test(addressForm.postalCode.trim()))
      next.postalCode = 'Kod pocztowy musi mieć format XX-XXX.';
    if (!addressForm.city.trim()) next.city = 'Miasto jest wymagane.';
    else if (addressForm.city.trim().length < 2)
      next.city = 'Miasto musi mieć co najmniej 2 znaki.';
    return next;
  }, [addressForm, hasSavedAddresses]);

  const addressValid = Object.keys(addressErrors).length === 0;
  const canSubmit = !isEmpty && Boolean(paymentMethodId) && addressValid && !submitting;

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'postalCode' ? formatPostalCode(value) : value;
    setAddressForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setApiError('');
    try {
      // address_id: placeholder do zastąpienia po integracji z backendem adresów
      const addressId = hasSavedAddresses ? Number(selectedAddressId) : 1;
      const payload = {
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        address_id: addressId,
        payment_method_id: Number(paymentMethodId),
        items: items.map((i) => ({
          menu_product_id: i.menuProductId,
          quantity: i.quantity,
        })),
        client_comment: comment.trim() ? comment.trim() : null,
      };
      await createOrder(payload);
      clearCart();
      navigate('/orders', {
        replace: true,
        state: { successMessage: 'Zamówienie zostało złożone!' },
      });
    } catch {
      setApiError('Nie udało się złożyć zamówienia. Spróbuj ponownie.');
      setSubmitting(false);
    }
  };

  if (isEmpty) {
    return (
      <div className={styles.emptyState}>
        <p>Twój koszyk jest pusty.</p>
        <Button onClick={() => navigate('/restaurants')}>Przeglądaj restauracje</Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Koszyk</h1>
      <div className={styles.layout}>
        <section className={styles.itemsColumn}>
          {items.map((item) => {
            const imageUrl = buildImageUrl(item.imagePath);
            return (
              <div key={item.menuProductId} className={styles.itemRow}>
                <div className={styles.itemThumb}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.productName}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={styles.thumbPlaceholder}>—</div>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.productName}</span>
                  <span className={styles.itemUnit}>{formatPrice(item.price)} / szt.</span>
                </div>
                <div className={styles.qtyControl}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.menuProductId, item.quantity - 1)}
                    aria-label="Zmniejsz"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.menuProductId, item.quantity + 1)}
                    aria-label="Zwiększ"
                  >
                    +
                  </button>
                </div>
                <span className={styles.itemTotal}>
                  {formatPrice(item.price * item.quantity)}
                </span>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeItem(item.menuProductId)}
                >
                  Usuń
                </button>
              </div>
            );
          })}
        </section>

        <aside className={styles.summaryColumn}>
          <h2 className={styles.summaryTitle}>{restaurantName}</h2>

          <ul className={styles.summaryList}>
            {items.map((item) => (
              <li key={item.menuProductId}>
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className={styles.totalRow}>
            <span>Do zapłaty</span>
            <span className={styles.totalPrice}>{formatPrice(totalPrice)}</span>
          </div>

          <label className={styles.fieldLabel} htmlFor="paymentMethod">
            Metoda płatności
          </label>
          <select
            id="paymentMethod"
            className={styles.select}
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
          >
            <option value="">— wybierz —</option>
            {paymentMethods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.method_description}
              </option>
            ))}
          </select>

          <label className={styles.fieldLabel} htmlFor="comment">
            Komentarz do zamówienia (opcjonalnie)
          </label>
          <textarea
            id="comment"
            className={styles.textarea}
            maxLength={100}
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 100))}
            placeholder="np. bez cebuli, proszę o sztućce"
          />
          <div className={styles.counter}>{comment.length} / 100</div>

          <label className={styles.fieldLabel}>Adres dostawy</label>
          {hasSavedAddresses ? (
            <select
              className={styles.select}
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
            >
              {savedAddresses.map((a) => (
                <option key={a.id_address} value={a.id_address}>
                  {a.street} {a.house_number}
                  {a.apartment_number ? `/${a.apartment_number}` : ''}, {a.postal_code} {a.city}
                </option>
              ))}
            </select>
          ) : (
            <div className={styles.addressForm}>
              <input
                className={styles.input}
                name="street"
                placeholder="Ulica"
                value={addressForm.street}
                onChange={handleAddressChange}
              />
              {addressErrors.street && <span className={styles.error}>{addressErrors.street}</span>}

              <div className={styles.inlineFields}>
                <input
                  className={styles.input}
                  name="houseNumber"
                  placeholder="Nr domu"
                  value={addressForm.houseNumber}
                  onChange={handleAddressChange}
                />
                <input
                  className={styles.input}
                  name="apartmentNumber"
                  placeholder="Nr lok. (opc.)"
                  value={addressForm.apartmentNumber}
                  onChange={handleAddressChange}
                />
              </div>
              {addressErrors.houseNumber && (
                <span className={styles.error}>{addressErrors.houseNumber}</span>
              )}

              <input
                className={styles.input}
                name="postalCode"
                placeholder="Kod pocztowy (XX-XXX)"
                value={addressForm.postalCode}
                onChange={handleAddressChange}
                maxLength={6}
              />
              {addressErrors.postalCode && (
                <span className={styles.error}>{addressErrors.postalCode}</span>
              )}

              <input
                className={styles.input}
                name="city"
                placeholder="Miasto"
                value={addressForm.city}
                onChange={handleAddressChange}
              />
              {addressErrors.city && <span className={styles.error}>{addressErrors.city}</span>}
            </div>
          )}

          {apiError && <div className={styles.apiError}>{apiError}</div>}

          <Button
            className={styles.submitButton}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? 'Składanie...' : 'Złóż zamówienie'}
          </Button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
