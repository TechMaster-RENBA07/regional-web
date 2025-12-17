import { useEffect, useState } from 'react';

export function VentasModal({ isOpen, onClose, onSave, ventaEditar, listaClientes = [], listaSesiones = [], listaPedidos = [] }) {
  
  const [formData, setFormData] = useState({
    idPedido: '', 
    idSesion: '',
    idCliente: '',
    tipoComprobante: 'Boleta',
    serieComprobante: 'B001',
    numeroComprobante: '',
    montoTotal: '',
    impuestos: 0,
    metodoPago: 'Efectivo',
    estado: 1
  });

  useEffect(() => {
    if (ventaEditar) {
      setFormData(ventaEditar);
    } else {
      const sesionPorDefecto = listaSesiones.length > 0 ? listaSesiones[0].idSesion : '';
      const clientePorDefecto = listaClientes.length > 0 ? listaClientes[0].idCliente : '';

      setFormData({
        idPedido: '', 
        idSesion: sesionPorDefecto,
        idCliente: clientePorDefecto,
        tipoComprobante: 'Boleta',
        serieComprobante: 'B001',
        numeroComprobante: '',
        montoTotal: '',
        impuestos: 0,
        metodoPago: 'Efectivo',
        estado: 1
      });
    }
  }, [ventaEditar, isOpen, listaClientes, listaSesiones]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Lógica especial si cambia el PEDIDO
    if (name === 'idPedido') {
        const pedidoSeleccionado = listaPedidos.find(p => p.id_pedido == value);
        // Si el pedido tiene un campo 'total', lo usamos para autocompletar el precio
        // Asumo que tu objeto pedido tiene un campo 'total' o 'monto'
        const totalDelPedido = pedidoSeleccionado ? (pedidoSeleccionado.total || 0) : '';
        
        // Calcular IGV automáticamente basado en ese total
        let impuestosCalc = 0;
        if(totalDelPedido) {
            const base = parseFloat(totalDelPedido) / 1.18;
            impuestosCalc = parseFloat((parseFloat(totalDelPedido) - base).toFixed(2));
        }

        setFormData(prev => ({
            ...prev,
            idPedido: value,
            montoTotal: totalDelPedido,
            impuestos: impuestosCalc
        }));
        return;
    }

    // Lógica normal y cálculo de IGV manual si editan el monto
    let finalValue = value;
    if (name === 'montoTotal') {
        const total = parseFloat(value);
        if (!isNaN(total)) {
            const base = total / 1.18;
            const igv = total - base;
            setFormData(prev => ({ ...prev, [name]: total, impuestos: parseFloat(igv.toFixed(2)) }));
            return;
        }
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-coffee-800/20 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-coffee-900 mb-6">
            {ventaEditar ? 'Editar Venta' : 'Registrar Pago de Pedido'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-coffee-800">Caja Activa</label>
              <select name="idSesion" value={formData.idSesion} onChange={handleChange} className="w-full p-2 border border-green-500 rounded bg-green-50 text-green-900 font-medium">
                {listaSesiones.map(s => (
                  <option key={s.idSesion} value={s.idSesion}>Caja #{s.idSesion} (Abierta)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-coffee-800">Cliente</label>
              <select name="idCliente" value={formData.idCliente} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded">
                {listaClientes.map(c => (
                  <option key={c.idCliente} value={c.idCliente}>{c.nombreRazonSocial}</option>
                ))}
              </select>
            </div>
          </div>

          {/* --- AQUÍ ESTÁ EL CAMBIO CLAVE: SELECCIONAR PEDIDO --- */}
          <div className="bg-orange-50 p-4 rounded border border-orange-200">
             <label className="text-sm font-bold text-coffee-900 block mb-2">Seleccionar Pedido a Pagar</label>
             {listaPedidos.length > 0 ? (
                 <select 
                    name="idPedido" 
                    value={formData.idPedido} 
                    onChange={handleChange} 
                    className="w-full p-3 border border-orange-300 rounded bg-white text-lg font-medium"
                    required
                 >
                    <option value="">-- Seleccione un Pedido --</option>
                    {listaPedidos.map(p => (
                        <option key={p.id_pedido} value={p.id_pedido}>
                            Pedido #{p.id_pedido} - Mesa {p.id_mesa?.numero || p.id_mesa} - (S/ {p.total || '0.00'})
                        </option>
                    ))}
                 </select>
             ) : (
                 <div className="text-red-600 font-bold p-2 bg-red-100 rounded text-center">
                    No hay pedidos pendientes en esta sucursal.
                 </div>
             )}
          </div>
          {/* --------------------------------------------------- */}

          <div className="grid grid-cols-3 gap-4">
            <div>
               <label className="text-sm font-semibold">Tipo</label>
               <select name="tipoComprobante" value={formData.tipoComprobante} onChange={handleChange} className="w-full p-2 border rounded">
                 <option value="Boleta">Boleta</option>
                 <option value="Factura">Factura</option>
               </select>
            </div>
            <div>
                <label className="text-sm font-semibold">Serie</label>
                <input name="serieComprobante" value={formData.serieComprobante} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
                <label className="text-sm font-semibold">Número</label>
                <input type="number" name="numeroComprobante" value={formData.numeroComprobante} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-sm font-semibold">Método Pago</label>
               <select name="metodoPago" value={formData.metodoPago} onChange={handleChange} className="w-full p-2 border rounded">
                 <option value="Efectivo">Efectivo</option>
                 <option value="Tarjeta">Tarjeta</option>
                 <option value="Yape">Yape / Plin</option>
               </select>
             </div>
             
             {/* TOTALES */}
             <div className="bg-cream-200 p-2 rounded">
                <label className="text-xs font-semibold text-gray-500 block">Monto Total (S/)</label>
                <input 
                    type="number" 
                    step="0.01" 
                    name="montoTotal" 
                    value={formData.montoTotal} 
                    onChange={handleChange} 
                    className="w-full p-2 border-2 border-terracotta-500 rounded font-bold text-xl text-right" 
                    placeholder="0.00"
                    required 
                />
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            <button 
                type="submit" 
                disabled={listaSesiones.length === 0 || listaPedidos.length === 0}
                className="px-6 py-2 bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-gray-400 text-white rounded shadow font-bold"
            >
                Procesar Pago
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}