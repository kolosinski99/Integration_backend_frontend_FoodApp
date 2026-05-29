import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import {
  isValidEmail,
  evaluatePassword,
  isPasswordStrong,
  extractApiError,
} from '../utils/validators';
import styles from './AuthForm.module.css';

const initialForm = {
  name: '',
  surname: '',
  email: '',
  street: '',
  houseNumber: '',
  apartmentNumber: '',
  postalCode: '',
  city: '',
  password: '',
  confirmPassword: '',
};

const POSTAL_CODE_REGEX = /^\d{2}-\d{3}$/;

const formatPostalCode = (raw) => {
  const digits = String(raw).replace(/\D/g, '').slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

const OPTIONAL_FIELDS = new Set(['apartmentNumber']);

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState('');
  const [errorKind, setErrorKind] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordChecks = useMemo(() => evaluatePassword(form.password), [form.password]);

  const fieldErrors = useMemo(() => {
    const next = {};

    if (!form.name.trim()) next.name = 'Imię jest wymagane.';
    else if (form.name.trim().length < 2) next.name = 'Imię musi mieć co najmniej 2 znaki.';

    if (!form.surname.trim()) next.surname = 'Nazwisko jest wymagane.';
    else if (form.surname.trim().length < 2)
      next.surname = 'Nazwisko musi mieć co najmniej 2 znaki.';

    if (!form.email.trim()) next.email = 'Email jest wymagany.';
    else if (!isValidEmail(form.email)) next.email = 'Nieprawidłowy format email.';

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

    if (!form.password) next.password = 'Hasło jest wymagane.';
    else if (!isPasswordStrong(form.password)) next.password = 'Hasło nie spełnia wymagań.';

    if (!form.confirmPassword) next.confirmPassword = 'Potwierdź hasło.';
    else if (form.password !== form.confirmPassword)
      next.confirmPassword = 'Hasła nie są identyczne.';

    return next;
  }, [form]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'postalCode' ? formatPostalCode(value) : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (apiError) setApiError('');
    if (errorKind) setErrorKind(null);
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const visibleError = (name) =>
    touched[name] || errors[name] ? errors[name] || fieldErrors[name] : undefined;

  const isFieldValid = (name) => {
    const value = (form[name] || '').toString();
    if (OPTIONAL_FIELDS.has(name)) return value.trim().length > 0 && !fieldErrors[name];
    return value.trim().length > 0 && !fieldErrors[name];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setErrorKind(null);
    setTouched(
      Object.keys(initialForm).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    if (!isFormValid) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        surname: form.surname.trim(),
        street: form.street.trim(),
        houseNumber: form.houseNumber.trim(),
        apartmentNumber: form.apartmentNumber.trim(),
        postalCode: form.postalCode.trim(),
        city: form.city.trim(),
      });
      navigate('/login', {
        replace: true,
        state: { successMessage: 'Konto zostało utworzone. Możesz się zalogować.' },
      });
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || '';
      const looksLikeDuplicate =
        status === 409 || /already exists|już istnieje|duplicate/i.test(message);
      if (looksLikeDuplicate) {
        setErrorKind('duplicate_email');
      } else {
        setErrorKind('generic');
        setApiError(extractApiError(err, 'Rejestracja nie powiodła się.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Rejestracja</h1>
      {errorKind === 'duplicate_email' && (
        <div className={styles.alertError}>
          Konto z tym adresem email już istnieje.{' '}
          <Link to="/login" className={styles.alertLink}>Zaloguj się</Link>{' '}
          lub użyj innego adresu.
        </div>
      )}
      {errorKind === 'generic' && apiError && (
        <div className={styles.alertError}>{apiError}</div>
      )}
      <form onSubmit={handleSubmit} noValidate>
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
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('email')}
          valid={isFieldValid('email')}
          autoComplete="email"
        />
        <Input
          label="Ulica"
          name="street"
          placeholder="np. ul. Marszałkowska"
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
          placeholder="np. 10"
          value={form.houseNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('houseNumber')}
          valid={isFieldValid('houseNumber')}
          maxLength={45}
        />
        <Input
          label="Numer mieszkania"
          name="apartmentNumber"
          placeholder="np. 2 (opcjonalne)"
          value={form.apartmentNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('apartmentNumber')}
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
          placeholder="np. Warszawa"
          value={form.city}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('city')}
          valid={isFieldValid('city')}
          maxLength={45}
          autoComplete="address-level2"
        />
        <Input
          label="Hasło"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('password')}
          valid={isFieldValid('password')}
          autoComplete="new-password"
          showPasswordToggle
          hint="Hasło musi spełniać wymagania poniżej."
        />
        <ul className={styles.requirements}>
          {passwordChecks.map((rule) => {
            const stateClass =
              form.password.length === 0
                ? ''
                : rule.passed
                ? styles.passed
                : styles.failed;
            return (
              <li key={rule.key} className={stateClass}>
                {rule.label}
              </li>
            );
          })}
        </ul>
        <Input
          label="Potwierdź hasło"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('confirmPassword')}
          valid={isFieldValid('confirmPassword')}
          autoComplete="new-password"
          showPasswordToggle
        />
        <Button
          type="submit"
          disabled={!isFormValid || submitting}
          className={styles.fullWidth}
        >
          {submitting ? 'Rejestracja...' : 'Zarejestruj się'}
        </Button>
      </form>
      <div className={styles.footer}>
        Masz już konto? <Link to="/login">Zaloguj się</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
