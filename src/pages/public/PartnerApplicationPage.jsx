import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  submitPartnerApplication,
  getRestaurantCategories
} from '../../api/applicationApi';

import Input from '../../components/Input';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';

import { isValidEmail } from '../../utils/validators';

import styles from './PartnerApplicationPage.module.css';

const POSTAL_CODE_REGEX = /^\d{2}-\d{3}$/;
const PHONE_REGEX = /^\d{9}$/;
const MESSAGE_MAX = 300;

const initialForm = {
  owner_first_name: '',
  owner_last_name: '',
  owner_email: '',
  owner_phone: '',

  restaurant_name: '',
  restaurant_category_id: '',

  restaurant_street: '',
  restaurant_house_number: '',
  restaurant_apartment_number: '',
  restaurant_postal_code: '',
  restaurant_city: '',

  message: '',
  image: null,
};

const formatPostalCode = (raw) => {

  const digits = String(raw)
      .replace(/\D/g, '')
      .slice(0, 5);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

const PartnerApplicationPage = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);

  const [errors, setErrors] = useState({});

  const [touched, setTouched] = useState({});

  const [apiError, setApiError] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const [successData, setSuccessData] = useState(null);

  useEffect(() => {

    let active = true;

    const load = async () => {

      try {

        const res = await getRestaurantCategories();

        if (active) {

          setCategories(
              Array.isArray(res.data)
                  ? res.data
                  : []
          );
        }

      } catch {

        if (active) {
          setCategories([]);
        }

      } finally {

        if (active) {
          setLoadingCategories(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };

  }, []);

  const fieldErrors = useMemo(() => {

    const next = {};

    if (!form.owner_first_name.trim()) {

      next.owner_first_name = 'Imię jest wymagane.';

    } else if (form.owner_first_name.trim().length < 2) {

      next.owner_first_name =
          'Imię musi mieć co najmniej 2 znaki.';
    }

    if (!form.owner_last_name.trim()) {

      next.owner_last_name = 'Nazwisko jest wymagane.';

    } else if (form.owner_last_name.trim().length < 2) {

      next.owner_last_name =
          'Nazwisko musi mieć co najmniej 2 znaki.';
    }

    if (!form.owner_email.trim()) {

      next.owner_email = 'Email jest wymagany.';

    } else if (!isValidEmail(form.owner_email)) {

      next.owner_email =
          'Nieprawidłowy format email.';
    }

    if (!form.owner_phone.trim()) {

      next.owner_phone = 'Telefon jest wymagany.';

    } else if (!PHONE_REGEX.test(form.owner_phone.trim())) {

      next.owner_phone =
          'Telefon musi zawierać dokładnie 9 cyfr.';
    }

    if (!form.restaurant_name.trim()) {

      next.restaurant_name =
          'Nazwa restauracji jest wymagana.';

    } else if (form.restaurant_name.trim().length < 3) {

      next.restaurant_name =
          'Nazwa musi mieć co najmniej 3 znaki.';
    }

    if (!form.restaurant_category_id) {

      next.restaurant_category_id =
          'Wybierz kategorię.';
    }

    if (!form.restaurant_street.trim()) {

      next.restaurant_street =
          'Ulica jest wymagana.';
    }

    if (!form.restaurant_house_number.trim()) {

      next.restaurant_house_number =
          'Numer domu jest wymagany.';
    }

    if (!form.restaurant_postal_code.trim()) {

      next.restaurant_postal_code =
          'Kod pocztowy jest wymagany.';

    } else if (
        !POSTAL_CODE_REGEX.test(
            form.restaurant_postal_code.trim()
        )
    ) {

      next.restaurant_postal_code =
          'Kod pocztowy musi mieć format XX-XXX.';
    }

    if (!form.restaurant_city.trim()) {

      next.restaurant_city =
          'Miasto jest wymagane.';
    }

    if (form.message.length > MESSAGE_MAX) {

      next.message =
          `Wiadomość może mieć maksymalnie ${MESSAGE_MAX} znaków.`;
    }

    return next;

  }, [form]);

  const isFormValid =
      Object.keys(fieldErrors).length === 0;

  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (name === 'image') {

      setForm((prev) => ({
        ...prev,
        image: files[0],
      }));

      return;
    }

    let nextValue = value;

    if (name === 'restaurant_postal_code') {

      nextValue = formatPostalCode(value);
    }

    if (name === 'owner_phone') {

      nextValue = value
          .replace(/\D/g, '')
          .slice(0, 9);
    }

    if (name === 'message') {

      nextValue = value.slice(0, MESSAGE_MAX);
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {

      setErrors((prev) => {

        const next = { ...prev };

        delete next[name];

        return next;
      });
    }

    if (apiError) {
      setApiError('');
    }
  };

  const handleBlur = (e) => {

    setTouched((prev) => ({
      ...prev,
      [e.target.name]: true,
    }));
  };

  const visibleError = (name) =>
      touched[name] || errors[name]
          ? errors[name] || fieldErrors[name]
          : undefined;

  const isFieldValid = (name) => {

    const value = (form[name] || '').toString();

    return (
        value.trim().length > 0 &&
        !fieldErrors[name]
    );
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setApiError('');

    setTouched(
        Object.keys(initialForm).reduce(
            (acc, key) => ({
              ...acc,
              [key]: true,
            }),
            {}
        )
    );

    if (!isFormValid) {

      setErrors(fieldErrors);

      return;
    }

    setSubmitting(true);

    try {

      const formData = new FormData();

      formData.append(
          'owner_first_name',
          form.owner_first_name
      );

      formData.append(
          'owner_last_name',
          form.owner_last_name
      );

      formData.append(
          'owner_email',
          form.owner_email
      );

      formData.append(
          'owner_phone',
          form.owner_phone
      );

      formData.append(
          'restaurant_name',
          form.restaurant_name.trim()
      );

      formData.append(
          'description',
          form.message.trim()
      );

      formData.append(
          'restaurant_category_id',
          Number(form.restaurant_category_id)
      );

      formData.append(
          'street',
          form.restaurant_street.trim()
      );

      formData.append(
          'house_number',
          form.restaurant_house_number.trim()
      );

      formData.append(
          'apartment_number',
          form.restaurant_apartment_number.trim()
      );

      formData.append(
          'postal_code',
          form.restaurant_postal_code.trim()
      );

      formData.append(
          'city',
          form.restaurant_city.trim()
      );

      if (form.image) {

        formData.append(
            'image',
            form.image
        );
      }

      const result = await submitPartnerApplication(formData);

      setSuccessData({
        email: form.owner_email,
        password: result.data?.generated_password || null,
      });

    } catch {

      setApiError(
          'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.'
      );

    } finally {

      setSubmitting(false);
    }
  };

  if (successData) {

    return (
        <div className={styles.successBox}>

          <h2>Zgłoszenie przyjęte!</h2>

          <p>
            Twoje konto zostało utworzone dla adresu{' '}
            <strong>{successData.email}</strong>.
          </p>

          {successData.password && (
              <div className={styles.passwordBox}>
                <p className={styles.passwordLabel}>
                  Twoje tymczasowe hasło:
                </p>
                <code className={styles.passwordValue}>
                  {successData.password}
                </code>
                <p className={styles.passwordHint}>
                  Zapisz to hasło — nie zostanie pokazane ponownie.
                  Po zalogowaniu zmień je w ustawieniach profilu.
                </p>
              </div>
          )}

          <p>
            Twoja restauracja czeka na zatwierdzenie przez administratora.
            Po zatwierdzeniu będzie widoczna dla klientów.
          </p>

          <button onClick={() => navigate('/login')}>
            Przejdź do logowania
          </button>

        </div>
    );
  }

  if (loadingCategories) {
    return <Spinner />;
  }

  return (
      <div className={styles.page}>

        <section className={styles.hero}>

          <h1 className={styles.heroTitle}>
            Działaj z nami
          </h1>

        </section>

        <section className={styles.formCard}>

          {apiError && (
              <div className={styles.alertError}>
                {apiError}
              </div>
          )}

          <form
              onSubmit={handleSubmit}
              noValidate
          >

            <h2 className={styles.sectionTitle}>
              Dane właściciela
            </h2>

            <Input
                label="Imię"
                name="owner_first_name"
                value={form.owner_first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={visibleError('owner_first_name')}
                valid={isFieldValid('owner_first_name')}
            />

            <Input
                label="Nazwisko"
                name="owner_last_name"
                value={form.owner_last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={visibleError('owner_last_name')}
                valid={isFieldValid('owner_last_name')}
            />

            <Input
                label="Email kontaktowy"
                name="owner_email"
                type="email"
                value={form.owner_email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={visibleError('owner_email')}
                valid={isFieldValid('owner_email')}
            />

            <Input
                label="Telefon kontaktowy"
                name="owner_phone"
                value={form.owner_phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={visibleError('owner_phone')}
                valid={isFieldValid('owner_phone')}
            />

            <h2 className={styles.sectionTitle}>
              Dane restauracji
            </h2>

            <Input
                label="Nazwa restauracji"
                name="restaurant_name"
                value={form.restaurant_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={visibleError('restaurant_name')}
                valid={isFieldValid('restaurant_name')}
            />

            <Input
                label="Ulica"
                name="restaurant_street"
                value={form.restaurant_street}
                onChange={handleChange}
                onBlur={handleBlur}
                error={visibleError('restaurant_street')}
                valid={isFieldValid('restaurant_street')}
            />

            <Input
                label="Numer domu"
                name="restaurant_house_number"
                value={form.restaurant_house_number}
                onChange={handleChange}
                onBlur={handleBlur}
                error={visibleError('restaurant_house_number')}
                valid={isFieldValid('restaurant_house_number')}
            />

            <Input
                label="Numer lokalu"
                name="restaurant_apartment_number"
                value={form.restaurant_apartment_number}
                onChange={handleChange}
                onBlur={handleBlur}
            />

            <Input
                label="Kod pocztowy"
                name="restaurant_postal_code"
                value={form.restaurant_postal_code}
                onChange={handleChange}
                onBlur={handleBlur}
                error={visibleError('restaurant_postal_code')}
                valid={isFieldValid('restaurant_postal_code')}
            />

            <Input
                label="Miasto"
                name="restaurant_city"
                value={form.restaurant_city}
                onChange={handleChange}
                onBlur={handleBlur}
                error={visibleError('restaurant_city')}
                valid={isFieldValid('restaurant_city')}
            />

            <div className={styles.field}>

              <label
                  htmlFor="restaurant_category_id"
                  className={styles.label}
              >
                Kategoria restauracji
              </label>

              <select
                  id="restaurant_category_id"
                  name="restaurant_category_id"
                  value={form.restaurant_category_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={styles.select}
              >

                <option value="">
                  — wybierz kategorię —
                </option>

                {categories.map((c) => (
                    <option
                        key={c.id}
                        value={c.id}
                    >
                      {c.category_name}
                    </option>
                ))}

              </select>

            </div>

            <div className={styles.field}>

              <label className={styles.label}>
                Zdjęcie restauracji
              </label>

              <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
              />

            </div>

            <div className={styles.field}>

              <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={4}
                  placeholder="Opis restauracji..."
                  className={styles.textarea}
              />

            </div>

            <Button
                type="submit"
                disabled={!isFormValid || submitting}
                className={styles.submit}
            >
              {submitting
                  ? 'Wysyłanie...'
                  : 'Wyślij zgłoszenie'}
            </Button>

          </form>

        </section>

      </div>
  );
};

export default PartnerApplicationPage;