import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminRestaurant } from '../../api/adminApi';
import { getRestaurantCategories } from '../../api/restaurantApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { isValidEmail } from '../../utils/validators';
import styles from './AdminRestaurantFormPage.module.css';

const initialForm = {
  owner_first_name: '',
  owner_last_name: '',
  owner_email: '',
  restaurant_name: '',
  restaurant_category_id: '',
  street: '',
  house_number: '',
  apartment_number: '',
  postal_code: '',
  city: '',
  description: '',
};

const POSTAL_REGEX = /^\d{2}-\d{3}$/;

const formatPostal = (raw) => {
  const d = String(raw).replace(/\D/g, '').slice(0, 5);
  return d.length <= 2 ? d : `${d.slice(0, 2)}-${d.slice(2)}`;
};

const AdminRestaurantFormPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [touched, setTouched] = useState({});

  useEffect(() => {
    getRestaurantCategories()
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, []);

  const fieldErrors = useMemo(() => {
    const e = {};
    if (!form.owner_first_name.trim())
      e.owner_first_name = 'Imię jest wymagane.';
    if (!form.owner_last_name.trim())
      e.owner_last_name = 'Nazwisko jest wymagane.';
    if (!form.owner_email.trim())
      e.owner_email = 'Email jest wymagany.';
    else if (!isValidEmail(form.owner_email))
      e.owner_email = 'Nieprawidłowy format email.';
    if (!form.restaurant_name.trim())
      e.restaurant_name = 'Nazwa restauracji jest wymagana.';
    if (!form.restaurant_category_id)
      e.restaurant_category_id = 'Wybierz kategorię.';
    if (!form.street.trim()) e.street = 'Ulica jest wymagana.';
    if (!form.house_number.trim())
      e.house_number = 'Numer domu jest wymagany.';
    if (!form.postal_code.trim())
      e.postal_code = 'Kod pocztowy jest wymagany.';
    else if (!POSTAL_REGEX.test(form.postal_code))
      e.postal_code = 'Format: XX-XXX';
    if (!form.city.trim()) e.city = 'Miasto jest wymagane.';
    return e;
  }, [form]);

  const isValid = Object.keys(fieldErrors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'postal_code') v = formatPostal(value);
    setForm((prev) => ({ ...prev, [name]: v }));
    if (apiError) setApiError('');
  };

  const handleBlur = (e) =>
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  const visibleError = (name) =>
    touched[name] ? fieldErrors[name] : undefined;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.keys(initialForm).reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (!isValid) return;
    setSubmitting(true);
    setApiError('');
    try {
      await createAdminRestaurant({
        owner_first_name: form.owner_first_name.trim(),
        owner_last_name: form.owner_last_name.trim(),
        owner_email: form.owner_email.trim(),
        restaurant_name: form.restaurant_name.trim(),
        restaurant_category_id: Number(form.restaurant_category_id),
        street: form.street.trim(),
        house_number: form.house_number.trim(),
        apartment_number: form.apartment_number.trim() || null,
        postal_code: form.postal_code.trim(),
        city: form.city.trim(),
        description: form.description.trim() || null,
      });
      navigate('/admin/dashboard', {
        state: { successMessage: 'Restauracja została dodana i zatwierdzona.' },
      });
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        'Nie udało się dodać restauracji. Spróbuj ponownie.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCats) return <Spinner />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dodaj restaurację</h1>
      <p className={styles.subtitle}>
        Restauracja zostanie automatycznie zatwierdzona.
        Właściciel otrzyma email z danymi do logowania.
      </p>

      {apiError && (
        <div className={styles.alertError}>{apiError}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <h2 className={styles.sectionTitle}>Dane właściciela</h2>
        <Input label="Imię" name="owner_first_name"
          value={form.owner_first_name} onChange={handleChange}
          onBlur={handleBlur} error={visibleError('owner_first_name')} />
        <Input label="Nazwisko" name="owner_last_name"
          value={form.owner_last_name} onChange={handleChange}
          onBlur={handleBlur} error={visibleError('owner_last_name')} />
        <Input label="Email" name="owner_email" type="email"
          value={form.owner_email} onChange={handleChange}
          onBlur={handleBlur} error={visibleError('owner_email')} />

        <h2 className={styles.sectionTitle}>Dane restauracji</h2>
        <Input label="Nazwa restauracji" name="restaurant_name"
          value={form.restaurant_name} onChange={handleChange}
          onBlur={handleBlur} error={visibleError('restaurant_name')} />

        <div className={styles.field}>
          <label htmlFor="cat" className={styles.label}>Kategoria</label>
          <select id="cat" name="restaurant_category_id"
            value={form.restaurant_category_id}
            onChange={handleChange} onBlur={handleBlur}
            className={styles.select}>
            <option value="">— wybierz —</option>
            {categories.map((c) => (
              <option key={c.id || c.id_restaurant_category}
                value={c.id || c.id_restaurant_category}>
                {c.category_name}
              </option>
            ))}
          </select>
          {visibleError('restaurant_category_id') && (
            <span className={styles.error}>
              {visibleError('restaurant_category_id')}
            </span>
          )}
        </div>

        <Input label="Ulica" name="street" value={form.street}
          onChange={handleChange} onBlur={handleBlur}
          error={visibleError('street')} />
        <Input label="Numer domu" name="house_number"
          value={form.house_number} onChange={handleChange}
          onBlur={handleBlur} error={visibleError('house_number')} />
        <Input label="Numer lokalu (opcjonalne)"
          name="apartment_number" value={form.apartment_number}
          onChange={handleChange} onBlur={handleBlur} />
        <Input label="Kod pocztowy" name="postal_code"
          value={form.postal_code} onChange={handleChange}
          onBlur={handleBlur} error={visibleError('postal_code')} />
        <Input label="Miasto" name="city" value={form.city}
          onChange={handleChange} onBlur={handleBlur}
          error={visibleError('city')} />

        <div className={styles.field}>
          <label htmlFor="desc" className={styles.label}>
            Opis (opcjonalny)
          </label>
          <textarea id="desc" name="description"
            value={form.description} onChange={handleChange}
            rows={3} maxLength={500}
            className={styles.textarea} />
        </div>

        <div className={styles.actions}>
          <Button type="submit" disabled={!isValid || submitting}>
            {submitting ? 'Dodawanie...' : 'Dodaj i zatwierdź restaurację'}
          </Button>
          <button type="button" className={styles.cancelButton}
            onClick={() => navigate('/admin/dashboard')}>
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminRestaurantFormPage;
