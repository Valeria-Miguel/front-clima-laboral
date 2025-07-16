import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ClientesDashboard.css';

const BienvenidaCliente = () => {
  return (
    <>
      <Header />
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="card-bienvenida" style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(32, 127, 96, 0.15)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
        }}>
          <h2 style={{ margin: 0 }}>Bienvenido</h2>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BienvenidaCliente;
