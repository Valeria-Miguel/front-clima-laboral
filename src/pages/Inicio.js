import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Banner from '../components/Banner';
import Footer from '../components/Footer';
import Header from '../components/Header';

const Inicio = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/registro');
  };

  const handleLoginClick = () => {
    navigate('/inicio-sesion');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0, padding: 0 }}>
      <Header />
        <Banner mensaje="¡Bienvenido a GDAY! Mejora tu productividad desde hoy." />
  

      <Footer />
    </div>
  );
};

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '1rem',
  borderRadius: '25px',
  border: 'none',
  backgroundColor: '#007bff',
  color: '#fff',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

export default Inicio;
