import React from 'react';

const Empleados_Tables = () => {
  const empleados = [
    { id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@example.com', cargo: 'Gerente', fechaIngreso: '2022-01-15' },
    { id: 2, nombre: 'Ana', apellido: 'Gómez', email: 'ana.gomez@example.com', cargo: 'Desarrolladora', fechaIngreso: '2023-03-10' },
    { id: 3, nombre: 'Luis', apellido: 'Martínez', email: 'luis.martinez@example.com', cargo: 'Analista', fechaIngreso: '2021-11-05' },
    { id: 4, nombre: 'Marta', apellido: 'López', email: 'marta.lopez@example.com', cargo: 'Recursos Humanos', fechaIngreso: '2020-07-20' },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <h2 style={{ color: '#1C818D', marginBottom: '20px' }}>Lista de Empleados</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#1C818D', color: 'white' }}>
          <tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Apellido</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Cargo</th>
            <th style={thStyle}>Fecha de ingreso</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((emp) => (
            <tr key={emp.id} style={trStyle}>
              <td style={tdStyle}>{emp.nombre}</td>
              <td style={tdStyle}>{emp.apellido}</td>
              <td style={tdStyle}>{emp.email}</td>
              <td style={tdStyle}>{emp.cargo}</td>
              <td style={tdStyle}>{emp.fechaIngreso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: '12px',
  borderBottom: '2px solid #166b75',
  textAlign: 'left',
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #ccc',
};

const trStyle = {
  backgroundColor: '#f9f9f9',
};

export default Empleados_Tables;
