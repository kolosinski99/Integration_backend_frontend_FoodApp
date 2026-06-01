import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  const partnerLinkClass = ({ isActive }) =>
    `${styles.partnerLink} ${isActive ? styles.partnerLinkActive : ''}`;

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>FoodOrder</Link>
      <div className={styles.actions}>
        {isAuthenticated && (
          <div className={styles.links}>
            {user?.role === 'USER' && (
              <>
                <NavLink to="/restaurants" className={navLinkClass}>
                  Restauracje
                </NavLink>
                <NavLink to="/orders" className={navLinkClass}>
                  Zamówienia
                </NavLink>
                <NavLink to="/cart" className={navLinkClass}>
                  Koszyk
                  {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
                </NavLink>
              </>
            )}
            {user?.role === 'OWNER' && (
              <>
                <NavLink to="/owner/dashboard" className={navLinkClass}>
                  Mój panel
                </NavLink>
                <NavLink to="/owner/menu" className={navLinkClass}>
                  Menu
                </NavLink>
                <NavLink to="/owner/orders" className={navLinkClass}>
                  Zamówienia
                </NavLink>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                Panel admina
              </NavLink>
            )}
          </div>
        )}
        {!isAuthenticated && (
          <NavLink to="/partner-application" className={partnerLinkClass}>
            Działaj z nami
          </NavLink>
        )}
        {isAuthenticated ? (
          <>
            <Link to="/profile" className={styles.greeting}>
              {user?.role === 'OWNER' && (
                <span className={styles.roleLabel}>Właściciel/ka </span>
              )}
              {user?.role === 'ADMIN' && (
                <span className={styles.roleLabel}>Administrator/ka </span>
              )}
              {user?.firstName || user?.email}
            </Link>
            <button className={styles.button} onClick={handleLogout}>
              Wyloguj
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Zaloguj</Link>
            <Link to="/register">Zarejestruj</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
