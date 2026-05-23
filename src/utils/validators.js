const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => EMAIL_REGEX.test(String(email).toLowerCase());

export const passwordRules = [
  { key: 'length', label: 'Co najmniej 8 znaków', test: (v) => v.length >= 8 },
  { key: 'digit', label: 'Co najmniej jedna cyfra', test: (v) => /\d/.test(v) },
  { key: 'upper', label: 'Co najmniej jedna wielka litera', test: (v) => /[A-Z]/.test(v) },
];

export const evaluatePassword = (value = '') =>
  passwordRules.map((rule) => ({
    key: rule.key,
    label: rule.label,
    passed: rule.test(value),
  }));

export const isPasswordStrong = (value = '') => passwordRules.every((rule) => rule.test(value));

export const extractApiError = (error, fallback = 'Wystąpił nieznany błąd. Spróbuj ponownie.') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.status === 401) return 'Nieprawidłowy email lub hasło.';
  if (error?.response?.status === 409) return 'Konto z tym adresem email już istnieje.';
  if (error?.message === 'Network Error') return 'Brak połączenia z serwerem.';
  return fallback;
};
