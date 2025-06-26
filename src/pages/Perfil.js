import React from 'react';

const Perfil = () => {
  const usuarioMock = {
    nombre: 'Andrea',
    apellidoPaterno: 'Pérez',
    apellidoMaterno: 'González',
    email: 'juan.perez@correo.com',
    contrasena: 'miContraseñaSegura123',
  };

  const handleSubscriptionRedirect = () => {
    alert('Redirigiendo a la página de suscripción...');
  };

  return (
    <div style={{ backgroundColor: '#F4F6FA', minHeight: '100vh', padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Perfil del Usuario</h2>
      
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <p><strong>Nombre:</strong> {usuarioMock.nombre}</p>
        <p><strong>Apellido Paterno:</strong> {usuarioMock.apellidoPaterno}</p>
        <p><strong>Apellido Materno:</strong> {usuarioMock.apellidoMaterno}</p>
        <p><strong>Correo:</strong> {usuarioMock.email}</p>
        <p><strong>Contraseña:</strong> {usuarioMock.contrasena}</p>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleSubscriptionRedirect}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#1976d2',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Suscribirse
          </button>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
