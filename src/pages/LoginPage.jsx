import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { isValidEmail } from '../utils/validators';
import styles from './AuthForm.module.css';

const INVALID_CREDENTIALS_MESSAGE = 'Nieprawidłowy email lub hasło.';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fieldErrors = useMemo(() => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email jest wymagany.';
    else if (!isValidEmail(form.email)) next.email = 'Nieprawidłowy format email.';
    if (!form.password) next.password = 'Hasło jest wymagane.';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setTouched({ email: true, password: true });
    if (!isFormValid) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      await login(form);
      navigate('/home', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 400 || status === 404) {
        setApiError(INVALID_CREDENTIALS_MESSAGE);
      } else if (err?.message === 'Network Error') {
        setApiError('Brak połączenia z serwerem.');
      } else {
        setApiError(INVALID_CREDENTIALS_MESSAGE);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Zaloguj się</h1>
      {successMessage && <div className={styles.alertSuccess}>{successMessage}</div>}
      {apiError && <div className={styles.alertError}>{apiError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('email')}
          autoComplete="email"
        />
        <Input
          label="Hasło"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleError('password')}
          autoComplete="current-password"
          showPasswordToggle
        />
        <Button
          type="submit"
          disabled={!isFormValid || submitting}
          className={styles.fullWidth}
        >
          {submitting ? 'Logowanie...' : 'Zaloguj się'}
        </Button>
      </form>
      <div className={styles.footer}>
        Nie masz konta? <Link to="/register">Zarejestruj się</Link>
      </div>
    </div>
  );
};

export default LoginPage;
