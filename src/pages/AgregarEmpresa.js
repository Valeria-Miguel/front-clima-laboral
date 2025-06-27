import Header from '../components/Header';
import Footer from '../components/Footer';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistroEmpresa.css';

const RegistroEmpresa = () => {
  const [empresa, setEmpresa] = useState('');
  const [correo, setCorreo] = useState('');
  const [ruc, setRuc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!empresa || !correo || !ruc || !telefono || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

  
    alert('Registro de empresa exitoso');
    navigate('/inicio-sesion'); 
  };

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Registro de Empresa</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <label>Nombre de Empresa:</label>
            <input
              type="text"
              className="registro-input"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              required
            />

            <label>Correo Electrónico:</label>
            <input
              type="email"
              className="registro-input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <label>RUC:</label>
            <input
              type="text"
              className="registro-input"
              value={ruc}
              onChange={(e) => setRuc(e.target.value)}
              required
            />

            <label>Teléfono:</label>
            <input
              type="tel"
              className="registro-input"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />

            <label>Contraseña:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="registro-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>

            {error && <p className="text-danger text-center mt-2">{error}</p>}

            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                Registrar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegistroEmpresa;