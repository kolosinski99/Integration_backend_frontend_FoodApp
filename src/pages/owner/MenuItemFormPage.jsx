import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createMenuItem,
  getMenuCategories,
  getMenuItemById,
  updateMenuItem,
} from '../../api/menuApi';
import { getMyRestaurant } from '../../api/restaurantApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { extractApiError } from '../../utils/validators';
import { parsePriceInput, priceInputToNumber } from '../../utils/format';
import styles from './MenuItemFormPage.module.css';

const DESCRIPTION_MAX = 255;
const NAME_MIN = 2;
const NAME_MAX = 45;
const PRICE_MIN = 0.01;
const PRICE_MAX = 9999.99;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const initialForm = {
  product_name: '',
  category_id: '',
  price: '',
  product_description: '',
  spiceLevel: 0,
  allergens: '',
};

const MenuItemFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [categoriesRes, restaurantRes] = await Promise.all([
          getMenuCategories(),
          getMyRestaurant(),
        ]);
        if (!active) return;
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setRestaurantId(restaurantRes.data?.id_restaurant || null);

        if (isEditMode) {
          const itemRes = await getMenuItemById(id);
          if (!active) return;
          const item = itemRes.data || {};
          setForm({
            product_name: item.product_name || '',
            category_id: item.category_id ? String(item.category_id) : '',
            price:
              item.price !== undefined && item.price !== null
                ? String(item.price).replace('.', ',')
                : '',
            product_description: item.product_description || '',
            spiceLevel: item.spice_level ?? 0,
            allergens: item.allergens ?? '',
          });
          setExistingImagePath(item.image_path || null);
        }
      } catch (err) {
        if (active) setApiError(extractApiError(err, 'Nie udało się załadować danych.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  const priceNumber = useMemo(() => priceInputToNumber(form.price), [form.price]);

  const fieldErrors = useMemo(() => {
    const next = {};
    const name = form.product_name.trim();
    if (!name) next.product_name = 'Nazwa dania jest wymagana.';
    else if (name.length < NAME_MIN)
      next.product_name = `Nazwa musi mieć co najmniej ${NAME_MIN} znaki.`;
    else if (name.length > NAME_MAX)
      next.product_name = `Nazwa może mieć maksymalnie ${NAME_MAX} znaków.`;

    if (!form.category_id) next.category_id = 'Wybierz kategorię.';

    if (!form.price || form.price.trim() === '') next.price = 'Cena jest wymagana.';
    else if (priceNumber === null || Number.isNaN(priceNumber))
      next.price = 'Nieprawidłowa cena.';
    else if (priceNumber < PRICE_MIN) next.price = `Cena musi być większa od ${PRICE_MIN} zł.`;
    else if (priceNumber > PRICE_MAX) next.price = `Cena nie może przekroczyć ${PRICE_MAX} zł.`;

    if (form.product_description.length > DESCRIPTION_MAX)
      next.product_description = `Opis może mieć maksymalnie ${DESCRIPTION_MAX} znaków.`;

    if (form.spiceLevel < 0 || form.spiceLevel > 3) {
      next.spiceLevel = 'Skala ostrości: 0–3';
    }

    if (form.allergens.length > 255) {
      next.allergens = 'Maksymalnie 255 znaków';
    }

    return next;
  }, [form, priceNumber]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const clearFieldError = (name) => {
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'price') nextValue = parsePriceInput(value);
    if (name === 'product_description') nextValue = value.slice(0, DESCRIPTION_MAX);
    if (name === 'product_name') nextValue = value.slice(0, NAME_MAX);
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    clearFieldError(name);
    if (apiError) setApiError('');
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Dozwolone formaty: JPG, PNG, WEBP.');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Zdjęcie nie może przekraczać 5MB.');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const visibleError = (name) =>
    touched[name] || errors[name] ? errors[name] || fieldErrors[name] : undefined;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setTouched({
      product_name: true,
      category_id: true,
      price: true,
      product_description: true,
    });
    if (!isFormValid) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('product_name', form.product_name.trim());
      formData.append('category_id', String(Number(form.category_id)));
      formData.append('price', String(Number(priceNumber.toFixed(2))));
      formData.append('product_description', form.product_description.trim());
      if (!isEditMode && restaurantId) {
        formData.append('restaurant_id', String(restaurantId));
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('spice_level', form.spiceLevel);
      if (form.allergens.trim())
        formData.append('allergens', form.allergens.trim());

      if (isEditMode) {
        await updateMenuItem(id, formData);
        navigate('/owner/menu', {
          replace: true,
          state: { successMessage: 'Dane dania zostały zaktualizowane.' },
        });
      } else {
        await createMenuItem(formData);
        navigate('/owner/menu', {
          replace: true,
          state: { successMessage: 'Danie zostało dodane do menu.' },
        });
      }
    } catch (err) {
      setApiError(extractApiError(err, 'Nie udało się zapisać dania.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <Spinner />;

  const currentImageUrl = existingImagePath
    ? /^https?:\/\//i.test(existingImagePath)
      ? existingImagePath
      : process.env.REACT_APP_API_URL
      ? `${process.env.REACT_APP_API_URL}/images/${existingImagePath}`
      : null
    : null;

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>
        {isEditMode ? 'Edytuj danie' : 'Dodaj nowe danie'}
      </h1>
      {apiError && <div className={styles.alertError}>{apiError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Nazwa dania"
          name="product_name"
          value={form.product_name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('product_name')}
          valid={form.product_name.trim().length > 0 && !fieldErrors.product_name}
          maxLength={NAME_MAX}
        />

        <div className={styles.field}>
          <label htmlFor="category_id" className={styles.label}>Kategoria</label>
          <select
            id="category_id"
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.select} ${visibleError('category_id') ? styles.selectError : ''}`}
          >
            <option value="">— wybierz kategorię —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.category_name}</option>
            ))}
          </select>
          {visibleError('category_id') && (
            <span className={styles.error}>{visibleError('category_id')}</span>
          )}
        </div>

        <Input
          label="Cena (zł)"
          name="price"
          inputMode="decimal"
          placeholder="np. 32,00"
          value={form.price}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('price')}
          valid={form.price.trim().length > 0 && !fieldErrors.price}
          hint="Format: kropka lub przecinek, max 2 miejsca po przecinku."
        />

        <div className={styles.field}>
          <label htmlFor="product_description" className={styles.label}>Opis dania</label>
          <textarea
            id="product_description"
            name="product_description"
            value={form.product_description}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={DESCRIPTION_MAX}
            rows={3}
            className={`${styles.textarea} ${visibleError('product_description') ? styles.selectError : ''}`}
          />
          <div className={styles.counter}>
            {form.product_description.length} / {DESCRIPTION_MAX}
          </div>
          {visibleError('product_description') && (
            <span className={styles.error}>{visibleError('product_description')}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Skala ostrości</label>
          <div className={styles.spiceRow}>
            {[
              { value: 0, label: '😌 Łagodne' },
              { value: 1, label: '🌶️ Lekko ostre' },
              { value: 2, label: '🌶️🌶️ Ostre' },
              { value: 3, label: '🌶️🌶️🌶️ Bardzo ostre' },
            ].map(opt => (
              <label key={opt.value} className={styles.spiceOption}>
                <input
                  type="radio"
                  name="spiceLevel"
                  value={opt.value}
                  checked={Number(form.spiceLevel) === opt.value}
                  onChange={() =>
                    setForm(prev => ({ ...prev, spiceLevel: opt.value }))
                  }
                />
                {opt.label}
              </label>
            ))}
          </div>
          {fieldErrors.spiceLevel && (
            <p className={styles.error}>{fieldErrors.spiceLevel}</p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="allergens" className={styles.label}>
            Alergeny (opcjonalne)
          </label>
          <textarea
            id="allergens"
            name="allergens"
            value={form.allergens}
            onChange={handleChange}
            rows={2}
            maxLength={255}
            placeholder="np. gluten, laktoza, orzechy, jaja"
            className={styles.textarea}
          />
          <div className={styles.allergenHints}>
            {['gluten', 'laktoza', 'orzechy', 'jaja', 'soja',
              'ryby', 'seler', 'gorczyca'].map(hint => (
              <button
                key={hint}
                type="button"
                className={styles.allergenHint}
                onClick={() =>
                  setForm(prev => ({
                    ...prev,
                    allergens: prev.allergens
                      ? `${prev.allergens}, ${hint}`
                      : hint,
                  }))
                }
              >
                + {hint}
              </button>
            ))}
          </div>
          <span className={styles.counter}>
            {form.allergens.length} / 255
          </span>
          {fieldErrors.allergens && (
            <p className={styles.error}>{fieldErrors.allergens}</p>
          )}
        </div>

        <div className={styles.field}>
          {isEditMode && currentImageUrl && !imagePreview && (
            <div className={styles.imagePreviewWrapper}>
              <p className={styles.imagePreviewLabel}>Aktualne zdjęcie</p>
              <img
                src={currentImageUrl}
                alt="Aktualne zdjęcie dania"
                className={styles.imagePreview}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <label htmlFor="image" className={styles.label}>
            Zdjęcie dania (opcjonalne)
          </label>
          <input
            id="image"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
          {imageError && <span className={styles.error}>{imageError}</span>}
          {imagePreview && (
            <div className={styles.imagePreviewWrapper}>
              <p className={styles.imagePreviewLabel}>Podgląd</p>
              <img
                src={imagePreview}
                alt="Podgląd zdjęcia dania"
                className={styles.imagePreview}
              />
              <button
                type="button"
                className={styles.removeImageButton}
                onClick={handleRemoveImage}
              >
                Usuń zdjęcie
              </button>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            disabled={!isFormValid || submitting}
            className={styles.submit}
          >
            {submitting
              ? 'Zapisywanie...'
              : isEditMode
              ? 'Zapisz zmiany'
              : 'Dodaj danie'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/owner/menu')}
          >
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemFormPage;
