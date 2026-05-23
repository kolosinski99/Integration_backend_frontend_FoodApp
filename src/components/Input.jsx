import React, { useState } from 'react';
import styles from './Input.module.css';

const Input = ({
  label,
  error,
  valid,
  hint,
  id,
  type = 'text',
  showPasswordToggle = false,
  ...rest
}) => {
  const [revealed, setRevealed] = useState(false);
  const inputId = id || rest.name;
  const isPassword = type === 'password';
  const effectiveType = isPassword && revealed ? 'text' : type;

  const wrapperClass = [
    styles.inputWrapper,
    error ? styles.wrapperError : '',
    !error && valid ? styles.wrapperValid : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={wrapperClass}>
        <input id={inputId} type={effectiveType} className={styles.input} {...rest} />
        {!error && valid && <span className={styles.validIcon} aria-hidden="true">✓</span>}
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Ukryj hasło' : 'Pokaż hasło'}
            tabIndex={-1}
          >
            {revealed ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {hint && !error && <div className={styles.hint}>{hint}</div>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Input;
