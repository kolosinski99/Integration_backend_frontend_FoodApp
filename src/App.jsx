import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        <AppRoutes />
      </main>
    </>
  );
}

export default App;
