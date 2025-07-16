import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/RegistroEmpresa.css';

const RegistroEscala = () => {
  const [form, setForm] = useState({
    nombre: '',
    valores: '',
    puntos: ''
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

    const valoresArray = form.valores.split(',').map(v => v.trim());
    const puntosArray = form.puntos.split(',').map(p => parseInt(p.trim(), 10));

    if (!form.nombre || valoresArray.length === 0 || puntosArray.length === 0) {
      setModalMessage('Por favor, completa todos los campos correctamente.');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/api/escalas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          valores: valoresArray,
          puntos: puntosArray
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al registrar escala');

      setModalMessage('✅ Escala registrada correctamente.');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate('/escalas');
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
          <h2 className="text-center mb-4">Registro de Escala</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre de la Escala:</label>
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
              <label htmlFor="valores">Valores (separados por coma):</label>
              <input
                type="text"
                id="valores"
                name="valores"
                className="registro-input"
                value={form.valores}
                onChange={handleChange}
                required
                placeholder="Ej. Sí, No"
              />
            </div>

            <div className="form-group">
              <label htmlFor="puntos">Puntos (separados por coma):</label>
              <input
                type="text"
                id="puntos"
                name="puntos"
                className="registro-input"
                value={form.puntos}
                onChange={handleChange}
                required
                placeholder="Ej. 1, 0"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Registrar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/escalas')}>
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

export default RegistroEscala;
