import React, { useEffect, useState } from 'react';
import styles from './SuccessBanner.module.css';

const SuccessBanner = ({ message, duration = 3000 }) => {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) return undefined;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!visible || !message) return null;
  return <div className={styles.banner}>{message}</div>;
};

export default SuccessBanner;
