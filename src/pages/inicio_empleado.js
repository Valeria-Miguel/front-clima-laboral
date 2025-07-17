import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ClientesDashboard.css'; 

const BienvenidaEmpleado = () => {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();

  // QUITA EL CODIGO DEL FOMULARIO DESPUES SE INSTEGRA 
  const manejarRespuesta = () => {
    if (!codigo.trim()) {
      alert('Por favor, ingresa un código válido');
      return;
    }
    //navigate(`/formulario/${codigo}`);
    navigate('/formulario'); 
  };

  return (
    <>
      <Header />
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="card-bienvenida" style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
          maxWidth: '450px',
          width: '100%',
        }}>
          <h2>Bienvenido</h2>
          <p>Por favor, ingresa el código.</p>
          <input
            type="text"
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              marginTop: '10px',
              width: '100%',
            }}
          />
          <button
            onClick={manejarRespuesta}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Responder formulario
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BienvenidaEmpleado;
