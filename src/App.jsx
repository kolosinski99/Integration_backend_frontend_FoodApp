import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Navbar />
      <main style={{
        maxWidth: 980,
        margin: '0 auto',
        padding: '32px 20px 60px',
      }}>
        <AppRoutes />
      </main>
    </CartProvider>
  );
}

export default App;
