import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
} from '../../api/restaurantApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { extractApiError } from '../../utils/validators';
import styles from './RestaurantFormPage.module.css';

const initialForm = {
  name: '',
  description: '',
  address: '',
  phone: '',
  imageUrl: '',
};

const PHONE_REGEX = /^\d{9}$/;
const URL_REGEX = /^https?:\/\/.+/i;

const RestaurantFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = location.pathname.endsWith('/edit');

  const [form, setForm] = useState(initialForm);
  const [restaurantId, setRestaurantId] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let active = true;
    const loadOwn = async () => {
      try {
        const response = await getMyRestaurant();
        if (!active) return;
        const data = response.data || {};
        setRestaurantId(data.id);
        setForm({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
          imageUrl: data.imageUrl || '',
        });
      } catch {
        if (active) setApiError('Nie udało się załadować danych restauracji.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadOwn();
    return () => {
      active = false;
    };
  }, [isEditMode]);

  const fieldErrors = useMemo(() => {
    const next = {};
    if (!form.name.trim()) next.name = 'Nazwa jest wymagana.';
    else if (form.name.trim().length < 3) next.name = 'Nazwa musi mieć co najmniej 3 znaki.';

    if (!form.description.trim()) next.description = 'Opis jest wymagany.';
    else if (form.description.trim().length < 10)
      next.description = 'Opis musi mieć co najmniej 10 znaków.';

    if (!form.address.trim()) next.address = 'Adres jest wymagany.';

    if (!form.phone.trim()) next.phone = 'Telefon jest wymagany.';
    else if (!PHONE_REGEX.test(form.phone.trim()))
      next.phone = 'Telefon musi zawierać dokładnie 9 cyfr.';

    if (form.imageUrl.trim() && !URL_REGEX.test(form.imageUrl.trim()))
      next.imageUrl = 'URL musi zaczynać się od http lub https.';

    return next;
  }, [form]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const visibleError = (name) =>
    touched[name] || errors[name] ? errors[name] || fieldErrors[name] : undefined;

  const isFieldValid = (name) => {
    const value = form[name] || '';
    if (name === 'imageUrl') return value.trim().length > 0 && !fieldErrors[name];
    return value.trim().length > 0 && !fieldErrors[name];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setTouched({
      name: true,
      description: true,
      address: true,
      phone: true,
      imageUrl: true,
    });
    if (!isFormValid) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        imageUrl: form.imageUrl.trim(),
      };
      if (isEditMode) {
        await updateRestaurant(restaurantId, payload);
        navigate('/owner/dashboard', {
          replace: true,
          state: { successMessage: 'Dane restauracji zostały zaktualizowane.' },
        });
      } else {
        await createRestaurant(payload);
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
          name="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('name')}
          valid={isFieldValid('name')}
        />
        <Input
          label="Opis"
          name="description"
          value={form.description}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('description')}
          valid={isFieldValid('description')}
        />
        <Input
          label="Adres"
          name="address"
          value={form.address}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('address')}
          valid={isFieldValid('address')}
        />
        <Input
          label="Telefon"
          name="phone"
          inputMode="numeric"
          value={form.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('phone')}
          valid={isFieldValid('phone')}
          hint="9 cyfr, bez spacji ani prefiksu kraju."
        />
        <Input
          label="URL zdjęcia (opcjonalne)"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('imageUrl')}
          valid={form.imageUrl.trim() ? isFieldValid('imageUrl') : false}
        />
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
