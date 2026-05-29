import React from 'react';
import styles from './RestaurantCard.module.css';

const truncate = (text, max = 100) => {

  if (!text) {
    return '';
  }

  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max).trimEnd()}...`;
};

const buildAddressLine = (r) => {

  const parts = [
    r.street,
    r.house_number
  ]
      .filter(Boolean)
      .join(' ');

  const city = [
    r.postal_code,
    r.city
  ]
      .filter(Boolean)
      .join(' ');

  return [
    parts,
    city
  ]
      .filter(Boolean)
      .join(', ');
};

const RestaurantCard = ({
                          restaurant,
                          onClick
                        }) => {

  const imageUrl = restaurant.image_path
      ? /^https?:\/\//i.test(
          restaurant.image_path
      )
          ? restaurant.image_path
          : `http://localhost:8080/uploads/${restaurant.image_path}`
      : null;

  console.log(
      'RESTAURANT:',
      restaurant
  );

  console.log(
      'IMAGE URL:',
      imageUrl
  );

  const handleKeyDown = (e) => {

    if (
        e.key === 'Enter' ||
        e.key === ' '
    ) {

      e.preventDefault();

      if (onClick) {
        onClick();
      }
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
              <img
                  src={imageUrl}
                  alt={restaurant.restaurant_name}
                  className={styles.image}
                  onError={(e) => {

                    console.log(
                        'BŁĄD ŁADOWANIA OBRAZU:',
                        imageUrl
                    );

                    e.target.style.display =
                        'none';
                  }}
              />
          ) : (
              <div
                  className={styles.placeholder}
              >
                Brak zdjęcia
              </div>
          )}

        </div>

        <div className={styles.body}>

          <h3 className={styles.name}>
            {restaurant.restaurant_name}
          </h3>

          <p className={styles.address}>
            {buildAddressLine(restaurant)}
          </p>

          <p className={styles.description}>
            {truncate(
                restaurant.description,
                100
            )}
          </p>

        </div>

      </div>
  );
};

export default RestaurantCard;