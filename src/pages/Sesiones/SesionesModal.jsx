import { useEffect, useState } from 'react';

export function SesionesModal({ isOpen, onClose, onSave, sesionEditar, idSucursalActual }) {
  
  const [formData, setFormData] = useState({
    montoInicial: '',
    montoFinalReal: '',
    observaciones: '',
    estado: 1
  });

  useEffect(() => {
    if (sesionEditar) {
      // MODO EDICIÓN / CIERRE
      setFormData({
        idSesion: sesionEditar.idSesion,
        idSucursal: sesionEditar.idSucursal,
        idUsuario: sesionEditar.idUsuario,
        montoInicial: sesionEditar.montoInicial,
        // Campos de cierre
        montoFinalCalculado: sesionEditar.montoFinalCalculado || 0,
        montoFinalReal: sesionEditar.montoFinalReal || '',
        diferencia: sesionEditar.diferencia || 0,
        estado: sesionEditar.estado
      });
    } else {
      // MODO APERTURA (NUEVO)
      setFormData({
        idSucursal: parseInt(idSucursalActual), // Tomamos el ID de la URL
        idUsuario: 23, // HARDCODED por ahora (según tu postman)
        montoInicial: '',
        estado: 1
      });
    }
  }, [sesionEditar, isOpen, idSucursalActual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
          {sesionEditar ? 'Gestionar Caja (Cierre)' : 'Apertura de Caja'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* MONTO INICIAL (Siempre visible, pero bloqueado al editar para no hacer trampa) */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Monto Inicial (S/)</label>
            <input 
              name="montoInicial" 
              type="number"
              value={formData.montoInicial} 
              onChange={handleChange}
              disabled={!!sesionEditar} // Si editas, no cambias el inicio
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500 disabled:bg-gray-100"
              required 
            />
          </div>

          {/* CAMPOS SOLO PARA CIERRE/EDICIÓN */}
          {sesionEditar && (
            <>
              <div>
                 <label className="text-sm font-semibold text-coffee-800">Monto Final Real (S/)</label>
                 <input 
                   name="montoFinalReal" 
                   type="number"
                   value={formData.montoFinalReal} 
                   onChange={handleChange}
                   className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500"
                 />
                 <p className="text-xs text-gray-500 mt-1">El sistema calculó: S/ {formData.montoFinalCalculado}</p>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded shadow transition">
                {sesionEditar ? 'Guardar Cierre' : 'Abrir Caja'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}