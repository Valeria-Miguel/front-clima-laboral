import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';
import ApiConfig from '../../apiConfig';

const BASE = (typeof ApiConfig === 'string' ? ApiConfig : ApiConfig.baseURL).replace(/\/+$/, '');

export default function CuestionariosDashboard() {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    (async () => {
      try {
        setLoading(true); setError(null);

        const res = await fetch(`${BASE}/api/cuestionarios`);
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('json') ? await res.json() : await res.text();

        if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || 'Error al cargar cuestionarios'));

        const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        if (mounted.current) setCuestionarios(list);
      } catch (e) {
        if (mounted.current) { setError('Error al cargar cuestionarios'); setCuestionarios([]); }
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();

    return () => { mounted.current = false; };
  }, []);

  const eliminarCuestionario = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cuestionario? Se eliminarán también sus secciones.')) return;
    try {
      const res = await fetch(`${BASE}/api/cuestionarios/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('json') ? await res.json() : await res.text();
      if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || 'Error al eliminar cuestionario'));
      alert('Cuestionario eliminado');
      window.location.reload();
    } catch (e) {
      alert('Error al eliminar el cuestionario');
    }
  };

  const editarCuestionario = (cuestionario) => navigate('/editar-cuestionario', { state: { cuestionario } });

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
}
