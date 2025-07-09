import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';

const UsuariosDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState('nombre');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:3003/usuarios');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar usuarios');
      setUsuarios(data);
      setTodosUsuarios(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarUsuarios = (valor = busqueda) => {
    const filtro = valor.toLowerCase();
    if (!filtro.trim()) {
      setUsuarios(todosUsuarios);
      return;
    }

    const resultados = todosUsuarios.filter(usuario => {
      if (tipoBusqueda === 'nombre') {
        return usuario.nombre.toLowerCase().includes(filtro) || usuario.apellidos.toLowerCase().includes(filtro);
      }
      if (tipoBusqueda === 'email') {
        return usuario.email.toLowerCase().includes(filtro);
      }
      return false;
    });

    setUsuarios(resultados);
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      const response = await fetch(`http://localhost:3003/usuarios/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar usuario');
      }
      alert('Usuario eliminado');
      fetchUsuarios();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editarUsuario = (usuario) => {
    navigate('/EditarUsuario', { 
      state: { 
        usuarioData: usuario
      } 
    });
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Usuarios Registrados</h2>
          <button className="btn-primary" onClick={() => navigate('/agregarusuarios')}>Registrar nuevo usuario</button>
        </div>

        <div className="dashboard-search">
          <select onChange={(e) => setTipoBusqueda(e.target.value)} value={tipoBusqueda}>
            <option value="nombre">Nombre</option>
            <option value="email">Correo Electrónico</option>
          </select>
          <input
            type="text"
            placeholder={`Buscar por ${tipoBusqueda}`}
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              buscarUsuarios(e.target.value);
            }}
          />
          <button onClick={() => buscarUsuarios()}>Buscar</button>
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
                <th>Apellidos</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario._id}>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.apellidos}</td>
                  <td>{usuario.telefono}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.rol}</td>
                  <td>
                    <button onClick={() => editarUsuario(usuario)}>Editar</button>
                    <button onClick={() => eliminarUsuario(usuario._id)}>Eliminar</button>
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

export default UsuariosDashboard;
