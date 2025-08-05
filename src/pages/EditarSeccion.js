import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/RegistroEmpresa.css';

const EditarSeccion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { seccion } = location.state || {};

  const [titulo, setTitulo] = useState(seccion?.titulo || '');
  const [reactivosTexto, setReactivosTexto] = useState(seccion?.reactivos?.join(',') || '');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!seccion) navigate('/cuestionarios');
  }, [seccion, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reactivos = reactivosTexto.split(',').map(r => r.trim()).filter(r => r.length > 0);
    if (!titulo || reactivos.length === 0) {
      setModalMessage('Todos los campos son obligatorios');
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch('http://localhost:3005/api/secciones/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: seccion._id, titulo, reactivos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar la sección');

      setModalMessage('✅ Sección actualizada correctamente');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate(`/secciones/${seccion.cuestionarioId}`);
      }, 2000);
    } catch (err) {
      setModalMessage(err.message);
      setShowModal(true);
    }
  };

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Editar Sección</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="titulo">Título:</label>
              <input
                type="text"
                id="titulo"
                className="registro-input"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reactivos">IDs de Reactivos (separados por coma):</label>
              <textarea
                id="reactivos"
                className="registro-textarea"
                value={reactivosTexto}
                onChange={e => setReactivosTexto(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Actualizar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate(`/secciones/${seccion.cuestionarioId}`)}>
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

export default EditarSeccion;
