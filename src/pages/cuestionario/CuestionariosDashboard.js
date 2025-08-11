import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';

const CuestionariosDashboard = () => {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCuestionarios = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/cuestionarios');
      const data = await response.json();
      console.log(data);
      if (!response.ok) throw new Error(data.message || 'Error al cargar cuestionarios');
      setCuestionarios(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCuestionarios([]);
    } finally {
      setLoading(false);
    }
  };

  const eliminarCuestionario = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cuestionario? Se eliminarán también sus secciones.')) return;
    try {
      const response = await fetch('http://localhost:3005/api/cuestionarios/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar cuestionario');
      }
      alert('Cuestionario eliminado');
      fetchCuestionarios();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editarCuestionario = (cuestionario) => {
    navigate('/editar-cuestionario', { state: { cuestionario } });
  };

  useEffect(() => {
    fetchCuestionarios();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Cuestionarios</h2>
          <button className="btn-primary" onClick={() => navigate('/registro-cuestionario')}>
            Registrar Cuestionario
          </button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuestionarios.map(c => (
                <tr key={c._id}>
                  <td>{c.nombre}</td>
                  <td>{c.tipo}</td>
                  <td>{new Date(c.fechaCreacion).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => editarCuestionario(c)}>Editar</button>
                    <button onClick={() => eliminarCuestionario(c._id)}>Eliminar</button>
                    <button onClick={() => navigate(`/secciones/${c._id}`)}>Ver Secciones</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CuestionariosDashboard;
