import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const RegistroEscala = () => {
  const [nombre, setNombre] = useState('');
  const [valores, setValores] = useState(['']);
  const [puntos, setPuntos] = useState([0]);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const agregarFila = () => {
    setValores([...valores, '']);
    setPuntos([...puntos, 0]);
  };

  const eliminarFila = (index) => {
    setValores(valores.filter((_, i) => i !== index));
    setPuntos(puntos.filter((_, i) => i !== index));
  };

  const handleValueChange = (index, value) => {
    const nuevos = [...valores];
    nuevos[index] = value;
    setValores(nuevos);
  };

  const handlePointChange = (index, value) => {
    const nuevos = [...puntos];
    nuevos[index] = Number(value);
    setPuntos(nuevos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || valores.length === 0 || puntos.length === 0) {
      setModalMessage('Por favor, completa todos los campos correctamente.');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/api/escalas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          valores,
          puntos
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
              <label>Nombre de la Escala:</label>
              <input
                type="text"
                className="registro-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            {valores.map((valor, index) => (
              <div key={index} className="valor-row">
                <button
                  type="button"
                  onClick={() => eliminarFila(index)}
                  className="btn-eliminar"
                  title="Eliminar fila"
                >
                  ❌
                </button>

                <div className="campo">
                  <label>Escribe la escala:</label>
                  <input
                    type="text"
                    className="registro-input"
                    value={valor}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    placeholder="Ej. Malo, Regular, Bueno..."
                    required
                  />
                </div>

                <div className="campo">
                  <label>Valor de la escala:</label>
                  <input
                    type="number"
                    className="registro-input"
                    value={puntos[index]}
                    onChange={(e) => handlePointChange(index, e.target.value)}
                    placeholder="Ej. 1, 2, 3..."
                    required
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={agregarFila} className="btn-agregar">
              ➕ Agregar Valor
            </button>

            <div className="form-buttons mt-4">
              <button type="submit" className="btn-primary">Registrar</button>
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

export default RegistroEscala;
