import React, { useState, useEffect } from 'react';
import api from '../api';
import { Modal, Button, Form } from 'react-bootstrap';

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventasOriginales, setVentasOriginales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [currentVenta, setCurrentVenta] = useState({
    cliente: '',
    detalles: [],
    total: 0,
    producto: '',
    cantidad: '',
  });
  const [clienteSeleccionado, setClienteSeleccionado] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    try {
      const ventasResponse = await api.get('ventas/');
      const productosResponse = await api.get('productos/');
      const clienteIds = [...new Set(ventasResponse.data.map(venta => venta.cliente))];
      const clientePromises = clienteIds.map(id => api.get(`clientes/${id}/`));
      const clienteResponses = await Promise.all(clientePromises);
  
      const clienteMap = clienteResponses.reduce((map, res) => {
        map[res.data.id] = res.data.nombre;
        return map;
      }, {});
  
      const ventasConClientes = ventasResponse.data.map(venta => ({
        ...venta,
        clienteNombre: clienteMap[venta.cliente] || 'No Disponible',
      }));
  
      setVentasOriginales(ventasConClientes);
      setVentas(ventasConClientes);
      setClientes(clienteResponses.map(res => res.data));
      setProductos(productosResponse.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };  

  useEffect(() => {
    fetchData();
  }, []);

  const filterVentasByDate = () => {
    let filteredVentas = [...ventasOriginales];
   
    if (startDate) {
      filteredVentas = filteredVentas.filter(venta => {
        const ventaFecha = new Date(venta.fecha).toISOString().split('T')[0];
        return ventaFecha >= startDate;
      });
    }
   
    if (endDate) {
      filteredVentas = filteredVentas.filter(venta => {
        const ventaFecha = new Date(venta.fecha).toISOString().split('T')[0];
        return ventaFecha <= endDate;
      });
    }
   
    setVentas(filteredVentas);
  };  

  const resetModalState = () => {
    setCurrentVenta({ cliente: '', detalles: [], total: 0, producto: '', cantidad: '' });
    setClienteSeleccionado(false); 
  };

  const handleCreateVenta = () => {
    const ventaData = {
      cliente: currentVenta.cliente,
      total: currentVenta.total,
      detalles: currentVenta.detalles,
    };

    api.post('ventas/', ventaData)
      .then(response => {
        setShowModal(false);
        resetModalState();
        fetchData();
      })
      .catch(error => {
        console.error('Error al crear la venta:', error);
      });
  };

  const handleAddDetalle = () => {
    const productoId = currentVenta.producto;
    const cantidad = parseInt(currentVenta.cantidad, 10);

    if (!productoId || !cantidad || cantidad <= 0) {
      console.error('Producto o cantidad invalidos.');
      return;
    }

    const producto = productos.find(p => p.id === parseInt(productoId, 10));

    if (!producto) {
      console.error('Producto no encontrado.');
      return;
    }

    const valorUnitario = producto.valor_venta;
    const valorProducto = valorUnitario * cantidad;
    const ivaCalculado = producto.maneja_iva ? valorProducto * 0.19 : 0;

    setCurrentVenta(prevState => ({
      ...prevState,
      detalles: [
        ...prevState.detalles,
        {
          producto: productoId,
          cantidad,
          valor_unitario: valorUnitario,
          valor_producto: valorProducto,
          iva_calculado: ivaCalculado,
        },
      ],
      total: prevState.total + valorProducto + ivaCalculado,
      producto: '',
      cantidad: '',
    }));

    setClienteSeleccionado(true);
  };

  const handleVentaDetalles = (ventaId) => {
    const venta = ventas.find(v => v.id === ventaId);
    if (venta) {
      setCurrentVenta({
        cliente: venta.cliente,
        detalles: venta.detalles,
        total: venta.total,
        producto: '',
        cantidad: '',
      });
      setClienteSeleccionado(true);
      setShowModalDetalle(true);
    }
  };

  return (
    <div className="container">
      <h2 className="my-4" style={{ color: '#0A6E2F' }}>Lista de Ventas</h2>

      {/* Filtro fecha */}
      <div className="row mb-4">
        <div className="col">
          <label>Fecha de Inicio</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col">
          <label>Fecha de Fin</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col mt-4">
          <button onClick={filterVentasByDate} className="btn btn-success">
            Filtrar
          </button>
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td>{new Date(venta.fecha).toLocaleDateString()}</td>
              <td>{venta.clienteNombre}</td>
              <td>${parseInt(venta.total).toLocaleString('es-CO')}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleVentaDetalles(venta.id)}
                >
                  Detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setShowModal(true)} className="btn btn-success">
        Agregar Venta
      </button>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetModalState();
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Crear Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <Form.Control
                as="select"
                value={currentVenta.cliente}
                onChange={(e) => setCurrentVenta({ ...currentVenta, cliente: e.target.value })}
                disabled={clienteSeleccionado}
              >
                <option value="">Seleccione un Cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                as="select"
                value={currentVenta.producto}
                onChange={(e) => setCurrentVenta({ ...currentVenta, producto: e.target.value })}
              >
                <option value="">Seleccione un Producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} - ${parseInt(producto.valor_venta).toLocaleString('es-CO')}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                value={currentVenta.cantidad || ''}
                placeholder="Cantidad"
                onChange={(e) => setCurrentVenta({ ...currentVenta, cantidad: e.target.value })}
              />
            </Form.Group>

            <Button variant="primary" className="mb-4 btn-success" onClick={handleAddDetalle}>
              Agregar Producto
            </Button>
          </Form>

          <h5 className="my-3">Detalles de la Venta</h5>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Valor Unitario</th>
                <th>Valor Productos</th>
                <th>IVA</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {currentVenta.detalles.map((detalle, index) => (
                <tr key={index}>
                  <td>{productos.find(p => p.id === parseInt(detalle.producto))?.nombre || 'Producto No Encontrado'}</td>
                  <td>{detalle.cantidad}</td>
                  <td>${parseInt(detalle.valor_unitario).toLocaleString('es-CO')}</td>
                  <td>${detalle.valor_producto.toLocaleString('es-CO')}</td>
                  <td>${parseInt(detalle.iva_calculado).toLocaleString('es-CO')}</td>
                  <td>${(detalle.valor_producto + detalle.iva_calculado).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5>Total: ${currentVenta.total.toLocaleString('es-CO')}</h5>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            resetModalState();
          }}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateVenta} className="btn btn-success">
            Guardar Venta
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showModalDetalle}
        onHide={() => {
          setShowModalDetalle(false);
          resetModalState();
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalle Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <Form.Control
                as="select"
                value={currentVenta.cliente}
                onChange={(e) => setCurrentVenta({ ...currentVenta, cliente: e.target.value })}
                disabled
              >
                <option value="">Seleccione un Cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>

          <table className="table table-bordered"> 
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Valor Unitario</th>
                <th>Valor Productos</th>
                <th>IVA</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {currentVenta.detalles.map((detalle, index) => (
                <tr key={index}>
                  <td>{productos.find(p => p.id === parseInt(detalle.producto))?.nombre || 'Producto No Encontrado'}</td>
                  <td>{detalle.cantidad}</td>
                  <td>${(parseInt(detalle.valor_producto) / detalle.cantidad).toLocaleString('es-CO')}</td>
                  <td>${parseInt(detalle.valor_producto).toLocaleString('es-CO')}</td>
                  <td>${parseInt(detalle.iva_calculado).toLocaleString('es-CO')}</td>
                  <td>${(parseInt(detalle.valor_producto) + parseInt(detalle.iva_calculado)).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5>Total: ${parseInt(currentVenta.total).toLocaleString('es-CO')}</h5>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Ventas;
