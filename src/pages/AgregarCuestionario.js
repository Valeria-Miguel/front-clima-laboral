import Header from '../components/Header';
import Footer from '../components/Footer';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistroEmpresa.css';

const RegistroCuestionario = () => {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
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

    if (Object.values(form).some(value => value.trim() === '')) {
      setModalMessage('Por favor, completa todos los campos.');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/api/cuestionarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al registrar el cuestionario');

      setModalMessage('✅ Cuestionario creado con éxito.');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate('/cuestionarios');
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
          <h2 className="text-center mb-4">Registrar Cuestionario</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="titulo">Título:</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  className="registro-input"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                  maxLength={200}
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
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoría:</label>
                <input
                  type="text"
                  id="categoria"
                  name="categoria"
                  className="registro-input"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Ej: Salud, Educación, etc."
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Registrar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/cuestionarios')}>Cancelar</button>
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

export default RegistroCuestionario;
