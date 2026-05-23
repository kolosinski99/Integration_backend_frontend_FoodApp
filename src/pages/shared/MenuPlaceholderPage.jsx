import React from 'react';
import { Link, useParams } from 'react-router-dom';

const MenuPlaceholderPage = () => {
  const { id } = useParams();
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <h1>Menu restauracji #{id}</h1>
      <p>Ten widok zostanie zaimplementowany w Module 3.</p>
      <Link to={`/restaurants/${id}`}>Wróć do szczegółów restauracji</Link>
    </div>
  );
};

export default MenuPlaceholderPage;
