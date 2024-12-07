import React, { useState, useEffect } from 'react';
import api from '../api';
import { Modal, Button, Form } from 'react-bootstrap';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCliente, setCurrentCliente] = useState({
    id: '',
    cedula: '',
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  // Cargar lista clientes
  useEffect(() => {
    api.get('clientes/')
      .then(response => {
        setClientes(response.data);
      })
      .catch(error => {
        console.error('Hubo un error al obtener los clientes:', error);
      });
  }, []);

  const handleCreateCliente = () => {
    api.post('clientes/', {
      cedula: currentCliente.cedula,
      nombre: currentCliente.nombre,
      direccion: currentCliente.direccion,
      telefono: currentCliente.telefono,
      email: currentCliente.email,
    })
      .then(response => {
        setClientes([...clientes, response.data]);
        setShowModal(false);
        setCurrentCliente({
          id: '',
          cedula: '',
          nombre: '',
          direccion: '',
          telefono: '',
          email: '',
        });
      })
      .catch(error => {
        console.error('Hubo un error al crear el cliente:', error);
      });
  };

  const handleEditCliente = (cliente) => {
    setIsEditing(true);
    setCurrentCliente({
      id: cliente.id,
      cedula: cliente.cedula,
      nombre: cliente.nombre,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.email,
    });
    setShowModal(true);
  };

  const handleUpdateCliente = () => {
    if (!currentCliente.id) {
      console.error('El cliente no tiene id, no se puede actualizar');
      return;
    }

    api.put(`clientes/${currentCliente.id}/`, {
      cedula: currentCliente.cedula,
      nombre: currentCliente.nombre,
      direccion: currentCliente.direccion,
      telefono: currentCliente.telefono,
      email: currentCliente.email,
    })
      .then(response => {
        setClientes(clientes.map(cliente =>
          cliente.id === currentCliente.id ? response.data : cliente
        ));
        setShowModal(false);
        setCurrentCliente({
          id: '',
          cedula: '',
          nombre: '',
          direccion: '',
          telefono: '',
          email: '',
        });
      })
      .catch(error => {
        console.error('Hubo un error al actualizar el cliente:', error);
      });
  };

  const handleDeleteCliente = (id) => {
    api.delete(`clientes/${id}/`)
      .then(() => {
        setClientes(clientes.filter(c => c.id !== id));
      })
      .catch(error => {
        console.error('Hubo un error al eliminar el cliente:', error);
      });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentCliente({
      id: '',
      cedula: '',
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
    });
  };

  return (
    <div className="container">
      <h2 className="my-4" style={{ color: '#0A6E2F' }}>Lista de Clientes</h2>

      {/* Lista clientes */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Cedula</th>
            <th>Nombre</th>
            <th>Direccion</th>
            <th>Telefono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.cedula}</td>
              <td>{cliente.nombre}</td>
              <td>{cliente.direccion}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.email}</td>
              <td>
                <button
                  onClick={() => handleEditCliente(cliente)}
                  className="btn btn-warning btn-sm me-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteCliente(cliente.id)}
                  className="btn btn-danger btn-sm"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setShowModal(true)} className="btn btn-success">
        Agregar Cliente
      </button>

      {/* Modal cliente */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cedula</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese la cedula"
                value={currentCliente.cedula}
                onChange={(e) => setCurrentCliente({ ...currentCliente, cedula: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre"
                value={currentCliente.nombre}
                onChange={(e) => setCurrentCliente({ ...currentCliente, nombre: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Direccion</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese la dirección"
                value={currentCliente.direccion}
                onChange={(e) => setCurrentCliente({ ...currentCliente, direccion: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Telefono</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el telefono"
                value={currentCliente.telefono}
                onChange={(e) => setCurrentCliente({ ...currentCliente, telefono: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingrese el email"
                value={currentCliente.email}
                onChange={(e) => setCurrentCliente({ ...currentCliente, email: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant={isEditing ? 'success' : 'success'} onClick={isEditing ? handleUpdateCliente : handleCreateCliente}>
            {isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Clientes;
