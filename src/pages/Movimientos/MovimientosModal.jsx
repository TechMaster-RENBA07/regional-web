import { useEffect, useState } from 'react';

// Recibimos "listaSesiones" para poder elegir a qué caja asociar el gasto/ingreso
export function MovimientosModal({ isOpen, onClose, onSave, movEditar, listaSesiones = [] }) {
  
  const [formData, setFormData] = useState({
    idSesion: '',
    idUsuario: 3, // Hardcoded por ahora
    tipoMovimiento: 'Ingreso', // Valor por defecto
    concepto: '',
    monto: '',
    estado: 1
  });

  useEffect(() => {
    if (movEditar) {
      setFormData({
        idMovimientoCaja: movEditar.idMovimientoCaja,
        idSesion: movEditar.idSesion,
        idUsuario: movEditar.idUsuario,
        tipoMovimiento: movEditar.tipoMovimiento,
        concepto: movEditar.concepto,
        monto: movEditar.monto,
        estado: 1
      });
    } else {
      // Al crear, seleccionamos la primera sesión disponible por defecto
      setFormData({
        idSesion: listaSesiones.length > 0 ? listaSesiones[0].idSesion : '',
        idUsuario: 23,
        tipoMovimiento: 'Ingreso',
        concepto: '',
        monto: '',
        estado: 1
      });
    }
  }, [movEditar, isOpen, listaSesiones]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si es ID o Monto, convertimos a número (si no está vacío)
    const val = (name === 'idSesion' || name === 'monto') && value !== '' ? Number(value) : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-coffee-800/20">
        
        <h2 className="text-2xl font-bold text-coffee-900 mb-6">
          {movEditar ? 'Editar Movimiento' : 'Registrar Movimiento'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* SELECCIONAR SESIÓN */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Sesión de Caja (ID)</label>
            <select
              name="idSesion"
              value={formData.idSesion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500 bg-white"
              required
            >
              <option value="" disabled>-- Selecciona Sesión --</option>
              {listaSesiones.map(s => (
                <option key={s.idSesion} value={s.idSesion}>
                  Sesión #{s.idSesion} (Iniciado con S/ {s.montoInicial})
                </option>
              ))}
            </select>
          </div>

          {/* TIPO MOVIMIENTO */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Tipo</label>
            <select
              name="tipoMovimiento"
              value={formData.tipoMovimiento}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500 bg-white"
            >
              {/* AQUÍ ESTÁ EL CAMBIO: El 'value' debe ser exacto a la BD */}
              <option value="Ingreso">Ingreso (+)</option>
              <option value="Egreso">Salida / Gasto (-)</option> 
            </select>
          </div>

          {/* CONCEPTO */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Concepto</label>
            <input 
              name="concepto" 
              value={formData.concepto} 
              onChange={handleChange} 
              placeholder="Ej: Compra de insumos, Venta extra..."
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500" 
              required 
            />
          </div>

          {/* MONTO */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Monto (S/)</label>
            <input 
              name="monto" 
              type="number" 
              step="0.01"
              value={formData.monto} 
              onChange={handleChange} 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500" 
              required 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded shadow transition">Guardar</button>
          </div>

        </form>
      </div>
    </div>
  );
}