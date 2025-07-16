import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/RegistroEmpresa.css';

const RegistroDimension = () => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'CLIMA'
  });

  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.descripcion || !form.tipo) {
      setModalMessage('Por favor, completa todos los campos.');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/api/dimensiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al registrar dimensión');

      setModalMessage('✅ Dimensión registrada correctamente.');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate('/dimensiones');
      }, 2500);
    } catch (err) {
      setModalMessage(err.message || 'Error desconocido');
      setShowModal(true);
    }
  };

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Registro de Dimensión</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="registro-input"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción:</label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="registro-input"
                value={form.descripcion}
                onChange={handleChange}
                required
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo">Tipo:</label>
              <select
                id="tipo"
                name="tipo"
                className="registro-input"
                value={form.tipo}
                onChange={handleChange}
                required
              >
                <option value="CLIMA">CLIMA</option>
                <option value="NOM035">NOM035</option>
              </select>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Registrar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/dimensiones')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-message">
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default RegistroDimension;
