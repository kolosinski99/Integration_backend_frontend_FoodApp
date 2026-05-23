import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', type = 'button', className = '', ...rest }) => {
  const variantClass = variant === 'secondary' ? styles.secondary : styles.primary;
  return (
    <button type={type} className={`${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
};

export default Button;
