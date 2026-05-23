import React from 'react';
import styles from './RestaurantCard.module.css';

const truncate = (text, max = 100) => {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
};

const RestaurantCard = ({ restaurant, onClick }) => {
  const { name, address, description, imageUrl } = restaurant;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>Brak zdjęcia</div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.address}>{address}</p>
        <p className={styles.description}>{truncate(description, 100)}</p>
      </div>
    </div>
  );
};

export default RestaurantCard;
