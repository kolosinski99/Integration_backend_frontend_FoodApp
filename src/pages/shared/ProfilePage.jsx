import React, { useEffect, useMemo, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../../api/profileApi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import SuccessBanner from '../../components/SuccessBanner';
import styles from './ProfilePage.module.css';

const POSTAL_CODE_REGEX = /^\d{2}-\d{3}$/;

const ROLE_LABELS = {
  USER: 'Klient',
  OWNER: 'Właściciel restauracji',
  ADMIN: 'Administrator',
};

const formatPostalCode = (raw) => {
  const digits = String(raw).replace(/\D/g, '').slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

const toFormShape = (profile) => ({
  name: profile?.name || '',
  surname: profile?.surname || '',
  street: profile?.address?.street || '',
  houseNumber: profile?.address?.house_number || '',
  apartmentNumber: profile?.address?.apartment_number || '',
  postalCode: profile?.address?.postal_code || '',
  city: profile?.address?.city || '',
});

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(toFormShape(null));
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProfile = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await getMyProfile();
      const fetched = res.data || {};

      const merged = {
        ...fetched,
        name: fetched.name || user?.name || user?.firstName || '',
        surname: fetched.surname || user?.surname || '',
        login: fetched.login || fetched.email || user?.email || user?.login || '',
        role: fetched.role || user?.role || '',
      };

      setProfile(merged);
      setForm(toFormShape(merged));
    } catch (err) {
      if (err?.response?.status === 404) {
        // No profile yet, use AuthContext fallback
        const fallback = {
          name: user?.name || user?.firstName || '',
          surname: user?.surname || '',
          login: user?.email || user?.login || '',
          role: user?.role || '',
          address: {
            street: '', house_number: '', apartment_number: '', postal_code: '', city: ''
          }
        };
        setProfile(fallback);
        setForm(toFormShape(fallback));
      } else {
        setLoadError('Nie udało się załadować danych profilu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fieldErrors = useMemo(() => {
    const next = {};
    if (!form.name.trim()) next.name = 'Imię jest wymagane.';
    else if (form.name.trim().length < 2)
      next.name = 'Imię musi mieć co najmniej 2 znaki.';

    if (!form.surname.trim()) next.surname = 'Nazwisko jest wymagane.';
    else if (form.surname.trim().length < 2)
      next.surname = 'Nazwisko musi mieć co najmniej 2 znaki.';

    if (!form.street.trim()) next.street = 'Ulica jest wymagana.';
    else if (form.street.trim().length < 3)
      next.street = 'Ulica musi mieć co najmniej 3 znaki.';

    if (!form.houseNumber.trim()) next.houseNumber = 'Numer domu jest wymagany.';

    if (!form.postalCode.trim()) next.postalCode = 'Kod pocztowy jest wymagany.';
    else if (!POSTAL_CODE_REGEX.test(form.postalCode.trim()))
      next.postalCode = 'Kod pocztowy musi mieć format XX-XXX.';

    if (!form.city.trim()) next.city = 'Miasto jest wymagane.';
    else if (form.city.trim().length < 2)
      next.city = 'Miasto musi mieć co najmniej 2 znaki.';

    return next;
  }, [form]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const enterEditMode = () => {
    setForm(toFormShape(profile));
    setErrors({});
    setTouched({});
    setApiError('');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm(toFormShape(profile));
    setErrors({});
    setTouched({});
    setApiError('');
    setIsEditing(false);
  };

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

  const visibleError = (name) =>
    touched[name] || errors[name] ? errors[name] || fieldErrors[name] : undefined;

  const isFieldValid = (name) => {
    const value = (form[name] || '').toString();
    return value.trim().length > 0 && !fieldErrors[name];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setTouched({
      name: true,
      surname: true,
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
      const apartment = form.apartmentNumber.trim();
      const payload = {
        name: form.name.trim(),
        surname: form.surname.trim(),
        address: {
          street: form.street.trim(),
          house_number: form.houseNumber.trim(),
          apartment_number: apartment ? apartment : null,
          postal_code: form.postalCode.trim(),
          city: form.city.trim(),
        },
      };
      const res = await updateMyProfile(payload);
      const updated = res.data || { ...profile, ...payload };
      setProfile(updated);
      setForm(toFormShape(updated));
      setIsEditing(false);
      setSuccessMessage('Dane zostały zaktualizowane.');
      if (typeof updateUser === 'function') {
        const addr = updated.address || payload.address;
        updateUser({
          name: updated.name || payload.name,
          surname: updated.surname || payload.surname,
          street: addr?.street,
          houseNumber: addr?.house_number,
          apartmentNumber: addr?.apartment_number ?? null,
          postalCode: addr?.postal_code,
          city: addr?.city,
        });
      }
    } catch {
      setApiError('Nie udało się zapisać zmian. Spróbuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <Spinner />;

  if (loadError) {
    return (
      <div className={styles.errorBox}>
        <p>{loadError}</p>
        <Button onClick={fetchProfile}>Spróbuj ponownie</Button>
      </div>
    );
  }

  if (!profile) return null;

  const email = profile.login || profile.email || user?.email || user?.login || '';
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || '—';
  const addr = profile.address || {};
  const apartmentSuffix = addr.apartment_number ? `/${addr.apartment_number}` : '';
  const addressLine = `${addr.street || ''} ${addr.house_number || ''}${apartmentSuffix}`.trim();
  const cityLine = `${addr.postal_code || ''} ${addr.city || ''}`.trim();

  return (
    <div className={styles.page}>
      <SuccessBanner
        message={successMessage}
        duration={3000}
        key={successMessage}
      />

      <h1 className={styles.title}>Mój profil</h1>

      {isEditing ? (
        <form onSubmit={handleSubmit} noValidate className={styles.card}>
          {apiError && <div className={styles.alertError}>{apiError}</div>}

          <h2 className={styles.sectionTitle}>Dane konta</h2>
          <div className={styles.readonlyRow}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.readonlyValue}>{email}</span>
          </div>
          <div className={styles.readonlyRow}>
            <span className={styles.fieldLabel}>Rola</span>
            <span className={styles.badge}>{roleLabel}</span>
          </div>

          <h2 className={styles.sectionTitle}>Dane osobowe</h2>
          <Input
            label="Imię"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={visibleError('name')}
            valid={isFieldValid('name')}
            maxLength={45}
            autoComplete="given-name"
          />
          <Input
            label="Nazwisko"
            name="surname"
            value={form.surname}
            onChange={handleChange}
            onBlur={handleBlur}
            error={visibleError('surname')}
            valid={isFieldValid('surname')}
            maxLength={45}
            autoComplete="family-name"
          />

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
            label="Numer mieszkania (opcjonalne)"
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

          <div className={styles.actions}>
            <Button
              type="submit"
              disabled={!isFormValid || submitting}
              className={styles.primaryAction}
            >
              {submitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Anuluj
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Dane konta</h2>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.readonlyValue}>{email}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>Rola</span>
            <span className={styles.badge}>{roleLabel}</span>
          </div>

          <h2 className={styles.sectionTitle}>Dane osobowe</h2>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>Imię</span>
            <span className={styles.readonlyValue}>{profile.name || '—'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>Nazwisko</span>
            <span className={styles.readonlyValue}>{profile.surname || '—'}</span>
          </div>

          <h2 className={styles.sectionTitle}>Adres</h2>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>Ulica i numer</span>
            <span className={styles.value}>{addressLine || '—'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.fieldLabel}>Miejscowość</span>
            <span className={styles.value}>{cityLine || '—'}</span>
          </div>

          <div className={styles.actions}>
            <Button onClick={enterEditMode}>Edytuj dane</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
