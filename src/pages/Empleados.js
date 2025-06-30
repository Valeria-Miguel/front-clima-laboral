import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import Footer from '../components/Footer';
import Header from '../components/Header';
import Empleados_Tables from '../components/tables/Empleados_Table'; 

const Empleados = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <Header />
      <div className="dashboard-container" style={{ padding: '40px 20px', minHeight: '80vh', backgroundColor: '#f0f8f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 15px',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '1.5px solid #1C818D',
              minWidth: '250px',
              flexGrow: 1,
            }}
          />
          <button
            onClick={() => navigate('/agregar-empleado')} // Ajusta la ruta según tu configuración
            style={{
              backgroundColor: '#1C818D',
              color: 'white',
              border: 'none',
              padding: '14px 34px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              minWidth: '180px',
            }}
          >
            Agregar Empleado
          </button>
        </div>

        <Empleados_Tables searchTerm={searchTerm} />
      </div>
      <Footer />
    </>
  );
};

export default Empleados;
