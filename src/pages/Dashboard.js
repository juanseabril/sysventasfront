import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Clientes from './Clientes';
import Productos from './Productos';
import Ventas from './Ventas';
import logo from '../assets/images/locatel.png';

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('clientes');
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    
    navigate('/');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Columna izquierda */}
        <div className="col-md-2 bg-light p-3" style={{ minHeight: '100vh' }}>
          <img src={logo} alt="Logo" style={{ width: '100%', marginBottom: '20px' }} />

          <ul className="list-group">
            <li
              className={`list-group-item ${selectedCategory === 'clientes' ? 'bg-success text-white' : ''}`}
              onClick={() => handleCategoryClick('clientes')}
              style={{ cursor: 'pointer' }}
            >
              Clientes
            </li>
            <li
              className={`list-group-item ${selectedCategory === 'productos' ? 'bg-success text-white' : ''}`}
              onClick={() => handleCategoryClick('productos')}
              style={{ cursor: 'pointer' }}
            >
              Productos
            </li>
            <li
              className={`list-group-item ${selectedCategory === 'ventas' ? 'bg-success text-white' : ''}`}
              onClick={() => handleCategoryClick('ventas')}
              style={{ cursor: 'pointer' }}
            >
              Ventas
            </li>
          </ul>

          {/* Enlace cerrar sesión */}
          <div className="mt-4" style={{ textAlign: 'center' }}>
            <span
              onClick={handleLogout}
              style={{
                cursor: 'pointer',
                color: '#E0A800',
                textDecoration: 'underline',
              }}
            >
              Cerrar sesión
            </span>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="col-md-10">
          {selectedCategory === 'clientes' && <Clientes />}
          {selectedCategory === 'productos' && <Productos />}
          {selectedCategory === 'ventas' && <Ventas />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
