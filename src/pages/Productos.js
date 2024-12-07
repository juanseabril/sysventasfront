import React, { useState, useEffect } from 'react';
import api from '../api';
import { Modal, Button, Form } from 'react-bootstrap';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProducto, setCurrentProducto] = useState({
    codigo: '',
    nombre: '',
    valor_venta: '',
    maneja_iva: false,
    porcentaje_iva: '',
  });

  // Cargar lista productos
  useEffect(() => {
    api.get('productos/')
      .then(response => {
        setProductos(response.data);
      })
      .catch(error => {
        console.error('Hubo un error al obtener los productos:', error);
      });
  }, []);

  const handleShowCreateModal = () => {
    setIsEditing(false);
    resetForm();
    setShowModal(true);
  };

  const handleCreateProducto = () => {
    api.post('productos/', {
      codigo: currentProducto.codigo,
      nombre: currentProducto.nombre,
      valor_venta: parseFloat(currentProducto.valor_venta),
      maneja_iva: currentProducto.maneja_iva,
      porcentaje_iva: currentProducto.maneja_iva
        ? parseFloat(currentProducto.porcentaje_iva) / 100
        : 0,
    })
      .then(response => {
        setProductos([...productos, response.data]);
        setShowModal(false);
        resetForm();
      })
      .catch(error => {
        console.error('Hubo un error al crear el producto:', error);
      });
  };

  const handleEditProducto = (producto) => {
    setIsEditing(true);
    setCurrentProducto({
      id: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      valor_venta: parseFloat(producto.valor_venta).toString(),
      maneja_iva: producto.maneja_iva,
      porcentaje_iva: producto.maneja_iva
        ? (producto.porcentaje_iva * 100).toString()
        : '',
    });
    setShowModal(true);
  };

  const handleUpdateProducto = () => {
    api.put(`productos/${currentProducto.id}/`, {
      codigo: currentProducto.codigo,
      nombre: currentProducto.nombre,
      valor_venta: parseFloat(currentProducto.valor_venta),
      maneja_iva: currentProducto.maneja_iva,
      porcentaje_iva: currentProducto.maneja_iva
        ? parseFloat(currentProducto.porcentaje_iva) / 100
        : 0,
    })
      .then(response => {
        setProductos(productos.map(producto =>
          producto.id === currentProducto.id ? response.data : producto
        ));
        setShowModal(false);
        resetForm();
      })
      .catch(error => {
        console.error('Hubo un error al actualizar el producto:', error);
      });
  };

  const handleDeleteProducto = (id) => {
    api.delete(`productos/${id}/`)
      .then(() => {
        setProductos(productos.filter(p => p.id !== id));
      })
      .catch(error => {
        console.error('Hubo un error al eliminar el producto:', error);
      });
  };

  const resetForm = () => {
    setCurrentProducto({
      codigo: '',
      nombre: '',
      valor_venta: '',
      maneja_iva: false,
      porcentaje_iva: '',
    });
  };

  return (
    <div className="container">
      <h2 className="my-4" style={{ color: '#0A6E2F' }}>Lista de Productos</h2>

      {/* Lista productos */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Valor Venta</th>
            <th>Maneja IVA</th>
            <th>Porcentaje IVA</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(producto => (
            <tr key={producto.id}>
              <td>{producto.codigo}</td>
              <td>{producto.nombre}</td>
              <td>${parseFloat(producto.valor_venta).toLocaleString('es-CO')}</td>
              <td>{producto.maneja_iva ? 'Si' : 'No'}</td>
              <td>{producto.maneja_iva ? `${producto.porcentaje_iva * 100}%` : '0%'}</td>
              <td>
                <button
                  onClick={() => handleEditProducto(producto)}
                  className="btn btn-warning btn-sm me-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteProducto(producto.id)}
                  className="btn btn-danger btn-sm"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleShowCreateModal} className="btn btn-success">
        Agregar Producto
      </button>

      {/* Modal producto */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Codigo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el codigo"
                value={currentProducto.codigo}
                onChange={(e) => setCurrentProducto({ ...currentProducto, codigo: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre"
                value={currentProducto.nombre}
                onChange={(e) => setCurrentProducto({ ...currentProducto, nombre: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Valor Venta</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese el valor de venta"
                value={currentProducto.valor_venta}
                onChange={(e) => setCurrentProducto({ ...currentProducto, valor_venta: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="¿Maneja IVA?"
                checked={currentProducto.maneja_iva}
                onChange={(e) => setCurrentProducto({ ...currentProducto, maneja_iva: e.target.checked })}
              />
            </Form.Group>
            {currentProducto.maneja_iva && (
              <Form.Group className="mb-3">
                <Form.Label>Porcentaje IVA</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingrese el porcentaje de IVA"
                  step="1"
                  value={currentProducto.porcentaje_iva}
                  onChange={(e) => setCurrentProducto({ ...currentProducto, porcentaje_iva: e.target.value })}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant={isEditing ? 'warning' : 'success'} onClick={isEditing ? handleUpdateProducto : handleCreateProducto}>
            {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Productos;
