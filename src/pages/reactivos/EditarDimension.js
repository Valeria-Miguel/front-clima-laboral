import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const EditarDimension = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dimensionData = location.state?.dimensionData;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!dimensionData) {
      navigate('/dimensiones');
      return;
    }

    setNombre(dimensionData.nombre);
    setDescripcion(dimensionData.descripcion);
    setTipo(dimensionData.tipo || 'CLIMA');
  }, [dimensionData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !descripcion || !tipo) {
      setModalMessage('Completa todos los campos');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/api/dimensiones/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dimensionData._id,
          nombre,
          descripcion,
          tipo
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al actualizar la dimensión');

      setModalMessage('✅ Dimensión actualizada correctamente');
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
          <h2 className="text-center mb-4">Editar Dimensión</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                className="registro-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                className="registro-input"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo:</label>
              <select
                className="registro-input"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
              >
                <option value="CLIMA">CLIMA</option>
                <option value="NOM035">NOM035</option>
              </select>
            </div>

            <div className="form-buttons mt-4">
              <button type="submit" className="btn-primary">Guardar cambios</button>
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

export default EditarDimension;
