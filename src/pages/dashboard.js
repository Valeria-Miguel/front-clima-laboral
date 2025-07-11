import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import Footer from '../components/Footer';
import Header from '../components/Header';

const DashboardMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  navigate('/login');
};

  const buttons = [
    { label: 'Ver Empleados CREHCE', path: '/usuarios' },
    { label: 'Ver Clientes', path: '/clientes' },
    { label: 'Análisis', path: '/analisis' },
    { label: 'Cuestionarios', path: '/cuestionarios' },
    { label: 'Preguntas', path: '/preguntas' },
    { label: 'Registrar Empleado', path: '/agregarusuarios' },
  ];

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Panel Principal</h1>
        <div className="dashboard-buttons">
          {buttons.map((btn, index) => (
            <button
              key={index}
              className="dashboard-btn"
              onClick={() => navigate(btn.path)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardMenu;
