import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const EditarCuestionario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cuestionario } = location.state || {};

  const [nombre, setNombre] = useState(cuestionario?.nombre || '');
  const [tipo, setTipo] = useState(cuestionario?.tipo || 'CLIMA');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!cuestionario) navigate('/cuestionarios');
  }, [cuestionario, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!nombre.trim()) {
      setModalMessage('El nombre no puede estar vacío');
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/cuestionarios/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cuestionario._id, nombre, tipo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar cuestionario');

      setModalMessage('✅ Cuestionario actualizado correctamente');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate('/cuestionarios');
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
          <h2 className="text-center mb-4">Editar Cuestionario</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tipo">Tipo de Cuestionario:</label>
              <select
                id="tipo"
                name="tipo"
                className="registro-input"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="CLIMA">CLIMA</option>
                <option value="NOM035">NOM035</option>
              </select>
            </div>

            <div className="form-group">
              <label>Cliente :</label>
              <input type="text" value={cuestionario?.nomEmpresa || ''} disabled className="registro-input" />
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre del Cuestionario:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="registro-input"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Actualizar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/cuestionarios')}>
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

export default EditarCuestionario;
