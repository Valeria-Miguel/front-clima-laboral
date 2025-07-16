
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';

const DimensionesDashboard = () => {
  const [dimensiones, setDimensiones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDimensiones = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/dimensiones');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar dimensiones');
      setDimensiones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarDimension = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta dimensión?')) return;
    try {
      const response = await fetch('http://localhost:3005/api/dimensiones/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      fetchDimensiones();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editarDimension = (dimension) => {
    navigate('/editar-dimension', { state: { dimensionData: dimension } });
  };

  useEffect(() => {
    fetchDimensiones();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Dimensiones Registradas</h2>
          <button className="btn-primary" onClick={() => navigate('/registro-dimension')}>
            ➕ Registrar nueva dimensión
          </button>
        </div>

        <div className="dashboard-search">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button onClick={fetchDimensiones}>Buscar</button>
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
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dimensiones
                .filter((d) => d.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                .map((dim) => (
                  <tr key={dim._id}>
                    <td>{dim.nombre}</td>
                    <td>{dim.descripcion}</td>
                    <td>
                      <button onClick={() => editarDimension(dim)}>Editar</button>
                      <button onClick={() => eliminarDimension(dim._id)}>Eliminar</button>
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

export default DimensionesDashboard;


