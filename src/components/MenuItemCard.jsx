import React from 'react';
import Button from './Button';
import { formatPrice } from '../utils/format';
import styles from './MenuItemCard.module.css';

const MenuItemCard = ({ menuItem, onAddToCart }) => {

    const {
        product_name,
        product_description,
        price,
        image_path
    } = menuItem;

    const isAbsoluteUrl = (value) =>
        /^https?:\/\//i.test(value || '');

    const imageUrl = image_path
        ? isAbsoluteUrl(image_path)
            ? image_path
            : `http://localhost:8080/uploads/${image_path}`
        : null;

    return (
        <div className={styles.card}>

            <div className={styles.imageWrapper}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product_name}
                        className={styles.image}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        Brak zdjęcia
                    </div>
                )}
            </div>

            <div className={styles.header}>
                <h3 className={styles.name}>
                    {product_name}
                </h3>

                <span className={styles.price}>
          {formatPrice(price)}
        </span>
            </div>

            {product_description && (
                <p className={styles.description}>
                    {product_description}
                </p>
            )}

            {menuItem.spice_level > 0 && (
                <div className={styles.spice}>
                    {'🌶️'.repeat(menuItem.spice_level)}
                </div>
            )}

            {menuItem.allergens && (
                <div className={styles.allergens}>
                    <span className={styles.allergenLabel}>Alergeny: </span>
                    {menuItem.allergens}
                </div>
            )}

            {onAddToCart && (
                <div className={styles.actions}>
                    <Button onClick={() => onAddToCart(menuItem)}>
                        Dodaj do koszyka
                    </Button>
                </div>
            )}

        </div>
    );
};

export default MenuItemCard;