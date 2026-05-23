import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ label = 'Ładowanie...' }) => (
  <div className={styles.wrapper} role="status" aria-live="polite">
    <div className={styles.spinner} />
    <span className={styles.label}>{label}</span>
  </div>
);

export default Spinner;
