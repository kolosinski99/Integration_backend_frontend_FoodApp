import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>FoodOrder</Link>
      <div className={styles.actions}>
        {isAuthenticated && (
          <div className={styles.links}>
            {user?.role === 'USER' && (
              <NavLink to="/restaurants" className={navLinkClass}>
                Restauracje
              </NavLink>
            )}
            {user?.role === 'OWNER' && (
              <NavLink to="/owner/dashboard" className={navLinkClass}>
                Mój panel
              </NavLink>
            )}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                Panel admina
              </NavLink>
            )}
          </div>
        )}
        {isAuthenticated ? (
          <>
            <span className={styles.greeting}>
              {user?.firstName || user?.email} {user?.role && <em>({user.role})</em>}
            </span>
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
