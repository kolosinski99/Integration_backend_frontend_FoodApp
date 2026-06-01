import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
} from '../../api/restaurantApi';
import { getRestaurantCategories } from '../../api/applicationApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { extractApiError } from '../../utils/validators';
import styles from './RestaurantFormPage.module.css';

const POSTAL_CODE_REGEX = /^\d{2}-\d{3}$/;
const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

const formatPostalCode = (raw) => {
  const digits = String(raw).replace(/\D/g, '').slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

const initialForm = {
  restaurantName: '',
  description: '',
  categoryId: '',
  street: '',
  houseNumber: '',
  apartmentNumber: '',
  postalCode: '',
  city: '',
  deliveryPrice: '',
  freeDeliveryFrom: '',
  minOrderAmount: '',
  openFrom: '',
  openTo: '',
  deliveryFrom: '',
  deliveryTo: '',
  pickupAvailable: false,
};

const RestaurantFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = location.pathname.endsWith('/edit');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [restaurantId, setRestaurantId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [currentImagePath, setCurrentImagePath] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [categoriesRes] = await Promise.all([getRestaurantCategories()]);
        if (!active) return;
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);

        if (isEditMode) {
          const response = await getMyRestaurant();
          if (!active) return;
          const data = response.data || {};
          setRestaurantId(data.id_restaurant);
          setCurrentImagePath(data.image_path || null);
          setForm({
            restaurantName: data.restaurant_name || '',
            description: data.description || '',
            categoryId: data.restaurant_category_id ? String(data.restaurant_category_id) : '',
            street: data.street || '',
            houseNumber: data.house_number || '',
            apartmentNumber: data.apartment_number || '',
            postalCode: data.postal_code || '',
            city: data.city || '',
            deliveryPrice: data.delivery_price ?? '',
            freeDeliveryFrom: data.free_delivery_from ?? '',
            minOrderAmount: data.min_order_amount ?? '',
            openFrom: data.open_from ?? '',
            openTo: data.open_to ?? '',
            deliveryFrom: data.delivery_from ?? '',
            deliveryTo: data.delivery_to ?? '',
            pickupAvailable: data.pickup_available === 1,
          });
        }
      } catch {
        if (active) setApiError('Nie udało się załadować danych.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isEditMode]);

  const fieldErrors = useMemo(() => {
    const next = {};
    if (!form.restaurantName.trim()) next.restaurantName = 'Nazwa jest wymagana.';
    else if (form.restaurantName.trim().length < 3)
      next.restaurantName = 'Nazwa musi mieć co najmniej 3 znaki.';

    if (!form.description.trim()) next.description = 'Opis jest wymagany.';
    else if (form.description.trim().length < 10)
      next.description = 'Opis musi mieć co najmniej 10 znaków.';

    if (!form.categoryId) next.categoryId = 'Wybierz kategorię.';

    if (!form.street.trim()) next.street = 'Ulica jest wymagana.';

    if (!form.houseNumber.trim()) next.houseNumber = 'Numer domu jest wymagany.';

    if (!form.postalCode.trim()) next.postalCode = 'Kod pocztowy jest wymagany.';
    else if (!POSTAL_CODE_REGEX.test(form.postalCode.trim()))
      next.postalCode = 'Kod pocztowy musi mieć format XX-XXX.';

    if (!form.city.trim()) next.city = 'Miasto jest wymagane.';

    if (form.deliveryPrice !== '' &&
        (isNaN(Number(form.deliveryPrice)) || Number(form.deliveryPrice) < 0)) {
      next.deliveryPrice = 'Podaj prawidłową cenę (np. 5.99)';
    }
    if (form.freeDeliveryFrom !== '' &&
        (isNaN(Number(form.freeDeliveryFrom)) || Number(form.freeDeliveryFrom) <= 0)) {
      next.freeDeliveryFrom = 'Podaj kwotę większą od 0';
    }
    if (form.minOrderAmount !== '' &&
        (isNaN(Number(form.minOrderAmount)) || Number(form.minOrderAmount) < 0)) {
      next.minOrderAmount = 'Podaj prawidłową kwotę';
    }
    if ((form.openFrom && !form.openTo) || (!form.openFrom && form.openTo)) {
      next.openHours = 'Podaj obie godziny otwarcia';
    }
    if ((form.deliveryFrom && !form.deliveryTo) || (!form.deliveryFrom && form.deliveryTo)) {
      next.deliveryHours = 'Podaj obie godziny dowozu';
    }

    return next;
  }, [form]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'postalCode') nextValue = formatPostalCode(value);
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (apiError) setApiError('');
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrl(null);
    }
  };

  const visibleError = (name) =>
    touched[name] || errors[name] ? errors[name] || fieldErrors[name] : undefined;

  const isFieldValid = (name) => {
    const value = form[name] || '';
    return value.toString().trim().length > 0 && !fieldErrors[name];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setTouched({
      restaurantName: true,
      description: true,
      categoryId: true,
      street: true,
      houseNumber: true,
      apartmentNumber: true,
      postalCode: true,
      city: true,
    });
    if (!isFormValid) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('restaurant_name', form.restaurantName.trim());
      formData.append('description', form.description.trim());
      formData.append('restaurant_category_id', form.categoryId);
      formData.append('street', form.street.trim());
      formData.append('house_number', form.houseNumber.trim());
      formData.append('apartment_number', form.apartmentNumber.trim());
      formData.append('postal_code', form.postalCode.trim());
      formData.append('city', form.city.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (form.deliveryPrice !== '')
        formData.append('delivery_price', form.deliveryPrice);
      if (form.freeDeliveryFrom !== '')
        formData.append('free_delivery_from', form.freeDeliveryFrom);
      if (form.minOrderAmount !== '')
        formData.append('min_order_amount', form.minOrderAmount);
      if (form.openFrom) formData.append('open_from', form.openFrom);
      if (form.openTo) formData.append('open_to', form.openTo);
      if (form.deliveryFrom) formData.append('delivery_from', form.deliveryFrom);
      if (form.deliveryTo) formData.append('delivery_to', form.deliveryTo);
      formData.append('pickup_available', form.pickupAvailable ? '1' : '0');

      if (isEditMode) {
        await updateRestaurant(restaurantId, formData);
        navigate('/owner/dashboard', {
          replace: true,
          state: { successMessage: 'Dane restauracji zostały zaktualizowane.' },
        });
      } else {
        await createRestaurant(formData);
        navigate('/owner/dashboard', {
          replace: true,
          state: { successMessage: 'Restauracja została dodana.' },
        });
      }
    } catch (err) {
      setApiError(extractApiError(err, 'Nie udało się zapisać restauracji.'));
    } finally {
      setSubmitting(false);
    }
  };

  const apiImageUrl =
    currentImagePath && process.env.REACT_APP_API_URL
      ? `${process.env.REACT_APP_API_URL}/images/${currentImagePath}`
      : null;

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>
        {isEditMode ? 'Edytuj restaurację' : 'Dodaj restaurację'}
      </h1>
      {apiError && <div className={styles.alertError}>{apiError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Nazwa restauracji"
          name="restaurantName"
          value={form.restaurantName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('restaurantName')}
          valid={isFieldValid('restaurantName')}
          maxLength={100}
        />
        <Input
          label="Opis"
          name="description"
          value={form.description}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('description')}
          valid={isFieldValid('description')}
          maxLength={500}
        />

        <div className={styles.field}>
          <label htmlFor="categoryId" className={styles.label}>Kategoria</label>
          <select
            id="categoryId"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">— wybierz kategorię —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
          {visibleError('categoryId') && (
            <span style={{ fontSize: 12, color: '#b71c1c' }}>{visibleError('categoryId')}</span>
          )}
        </div>

        <h2 className={styles.sectionTitle}>Adres</h2>
        <Input
          label="Ulica"
          name="street"
          value={form.street}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('street')}
          valid={isFieldValid('street')}
          maxLength={45}
          autoComplete="address-line1"
        />
        <Input
          label="Numer domu"
          name="houseNumber"
          value={form.houseNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('houseNumber')}
          valid={isFieldValid('houseNumber')}
          maxLength={45}
        />
        <Input
          label="Numer lokalu (opcjonalne)"
          name="apartmentNumber"
          value={form.apartmentNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          valid={form.apartmentNumber.trim().length > 0}
          maxLength={45}
        />
        <Input
          label="Kod pocztowy"
          name="postalCode"
          placeholder="np. 00-001"
          value={form.postalCode}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('postalCode')}
          valid={isFieldValid('postalCode')}
          maxLength={6}
          autoComplete="postal-code"
        />
        <Input
          label="Miasto"
          name="city"
          value={form.city}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('city')}
          valid={isFieldValid('city')}
          maxLength={45}
          autoComplete="address-level2"
        />

        <div className={styles.section}>
          <h3 className={styles.sectionHeading}>Godziny pracy</h3>

          <div className={styles.timeRow}>
            <div className={styles.timeField}>
              <label htmlFor="openFrom" className={styles.label}>
                Otwarcie od
              </label>
              <input
                id="openFrom"
                type="time"
                name="openFrom"
                value={form.openFrom}
                onChange={handleChange}
                className={styles.timeInput}
              />
            </div>
            <span className={styles.timeSep}>—</span>
            <div className={styles.timeField}>
              <label htmlFor="openTo" className={styles.label}>
                Zamknięcie
              </label>
              <input
                id="openTo"
                type="time"
                name="openTo"
                value={form.openTo}
                onChange={handleChange}
                className={styles.timeInput}
              />
            </div>
          </div>
          {fieldErrors.openHours && (
            <p className={styles.fieldError}>{fieldErrors.openHours}</p>
          )}

          <div className={styles.timeRow} style={{ marginTop: 12 }}>
            <div className={styles.timeField}>
              <label htmlFor="deliveryFrom" className={styles.label}>
                Dowóz od
              </label>
              <input
                id="deliveryFrom"
                type="time"
                name="deliveryFrom"
                value={form.deliveryFrom}
                onChange={handleChange}
                className={styles.timeInput}
              />
            </div>
            <span className={styles.timeSep}>—</span>
            <div className={styles.timeField}>
              <label htmlFor="deliveryTo" className={styles.label}>
                Dowóz do
              </label>
              <input
                id="deliveryTo"
                type="time"
                name="deliveryTo"
                value={form.deliveryTo}
                onChange={handleChange}
                className={styles.timeInput}
              />
            </div>
          </div>
          {fieldErrors.deliveryHours && (
            <p className={styles.fieldError}>{fieldErrors.deliveryHours}</p>
          )}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionHeading}>Warunki dostawy</h3>

          <Input
            label="Cena dostawy (zł)"
            name="deliveryPrice"
            type="number"
            min="0"
            step="0.01"
            value={form.deliveryPrice}
            onChange={handleChange}
            error={fieldErrors.deliveryPrice}
            hint="Wpisz 0 jeśli dostawa jest bezpłatna"
          />

          <Input
            label="Darmowa dostawa od kwoty (zł, opcjonalne)"
            name="freeDeliveryFrom"
            type="number"
            min="0"
            step="0.01"
            value={form.freeDeliveryFrom}
            onChange={handleChange}
            error={fieldErrors.freeDeliveryFrom}
            hint="Pozostaw puste jeśli nie oferujesz darmowej dostawy"
          />

          <Input
            label="Minimalna kwota zamówienia (zł)"
            name="minOrderAmount"
            type="number"
            min="0"
            step="0.01"
            value={form.minOrderAmount}
            onChange={handleChange}
            error={fieldErrors.minOrderAmount}
            hint="Wpisz 0 jeśli brak minimum"
          />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionHeading}>Odbiór osobisty</h3>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="pickupAvailable"
              checked={form.pickupAvailable}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  pickupAvailable: e.target.checked,
                }))
              }
              className={styles.checkbox}
            />
            Oferuję możliwość odbioru osobistego
          </label>
        </div>

        <h2 className={styles.sectionTitle}>Zdjęcie</h2>
        {isEditMode && apiImageUrl && !imagePreviewUrl && (
          <div className={styles.imagePreviewWrapper}>
            <p className={styles.imagePreviewLabel}>Aktualne zdjęcie</p>
            <img src={apiImageUrl} alt="Aktualne zdjęcie restauracji" className={styles.imagePreview} />
          </div>
        )}
        <div className={styles.field}>
          <label htmlFor="imageFile" className={styles.label}>
            Zdjęcie restauracji {isEditMode ? '(zostaw puste, by nie zmieniać)' : '(opcjonalne)'}
          </label>
          <input
            id="imageFile"
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </div>
        {imagePreviewUrl && (
          <div className={styles.imagePreviewWrapper}>
            <p className={styles.imagePreviewLabel}>Podgląd</p>
            <img src={imagePreviewUrl} alt="Podgląd zdjęcia" className={styles.imagePreview} />
          </div>
        )}

        <div className={styles.actions}>
          <Button
            type="submit"
            disabled={!isFormValid || submitting}
            className={styles.fullWidth}
          >
            {submitting
              ? 'Zapisywanie...'
              : isEditMode
              ? 'Zapisz zmiany'
              : 'Dodaj restaurację'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/owner/dashboard')}
          >
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantFormPage;
