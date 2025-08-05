import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const EditarEscala = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const escalaData = location.state?.escalaData;

  const [nombre, setNombre] = useState('');
  const [valores, setValores] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!escalaData) {
      navigate('/escalas');
      return;
    }

    setNombre(escalaData.nombre);
    setValores(escalaData.valores || []);
    setPuntos(escalaData.puntos || []);
  }, [escalaData, navigate]);

  const handleValueChange = (index, newValue) => {
    const nuevosValores = [...valores];
    nuevosValores[index] = newValue;
    setValores(nuevosValores);
  };

  const handlePointChange = (index, newPoint) => {
    const nuevosPuntos = [...puntos];
    nuevosPuntos[index] = Number(newPoint);
    setPuntos(nuevosPuntos);
  };

  const agregarFila = () => {
    setValores([...valores, '']);
    setPuntos([...puntos, 0]);
  };

  const eliminarFila = (index) => {
    setValores(valores.filter((_, i) => i !== index));
    setPuntos(puntos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || valores.length === 0 || puntos.length === 0) {
      setModalMessage('Completa todos los campos');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/api/escalas/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: escalaData._id,
          nombre,
          valores,
          puntos,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al actualizar la escala');

      setModalMessage('✅ Escala actualizada correctamente');
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
          <h2 className="text-center mb-4">Editar Escala</h2>
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
              <label>Valores y Puntos:</label>
              {valores.map((valor, index) => (
                <div key={index} className="form-row">
                  <input
                    type="text"
                    className="registro-input"
                    value={valor}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    placeholder="Valor"
                    required
                  />
                  <input
                    type="number"
                    className="registro-input"
                    value={puntos[index]}
                    onChange={(e) => handlePointChange(index, e.target.value)}
                    placeholder="Punto"
                    required
                  />
                  <button type="button" onClick={() => eliminarFila(index)} className="btn-danger">
                    ❌
                  </button>
                </div>
              ))}
              <button type="button" onClick={agregarFila} className="btn-secondary mt-2">
                ➕ Agregar Valor
              </button>
            </div>

            <div className="form-buttons mt-4">
              <button type="submit" className="btn-primary">Guardar cambios</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/escalas')}>Cancelar</button>
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

export default EditarEscala;
