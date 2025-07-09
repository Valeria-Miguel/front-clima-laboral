import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const EditarCuestionario = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cuestionarioData } = location.state || {};
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCuestionario = async () => {
      try {
        if (!cuestionarioData?._id) {
          throw new Error('No se proporcionaron datos del cuestionario');
        }

        const response = await fetch(`http://localhost:3005/api/cuestionarios/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cuestionarioData._id }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo cargar el cuestionario');

        setForm(data);
      } catch (err) {
        setModalMessage(err.message);
        setShowModal(true);
        setTimeout(() => navigate('/cuestionarios'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchCuestionario();
  }, [cuestionarioData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedForm = { id: cuestionarioData._id, ...form };

      const response = await fetch(`http://localhost:3005/api/cuestionarios/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar cuestionario');
      }

      setModalMessage('✅ Cuestionario actualizado correctamente');
      setShowModal(true);
      setTimeout(() => navigate('/cuestionarios'), 2000);
    } catch (err) {
      setModalMessage(`❌ Error: ${err.message}`);
      setShowModal(true);
    }
  };

  if (loading || !form) return <p className="text-center">Cargando cuestionario...</p>;

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Editar Cuestionario</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {[ 
                { label: 'Título', name: 'titulo' },
                { label: 'Descripción', name: 'descripcion' },
              ].map(({ label, name }) => (
                <div className="form-group" key={name}>
                  <label htmlFor={name}>{label}</label>
                  <input
                    type="text"
                    name={name}
                    id={name}
                    className="registro-input"
                    value={form[name] || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Guardar cambios</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/cuestionarios')}
              >
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
            <button onClick={() => {
              setShowModal(false);
              if (modalMessage.includes('✅')) {
                navigate('/cuestionarios');
              }
            }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default EditarCuestionario;
