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
