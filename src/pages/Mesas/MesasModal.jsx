import { useEffect, useState } from 'react';

export function MesasModal({ isOpen, onClose, onSave, mesaEditar, idSucursalActual }) {
  
  const [formData, setFormData] = useState({
    id_sucursal: '',
    numero_mesa: '',
    capacidad: '',
    estado_mesa: 'Disponible',
    estado: 1
  });

  useEffect(() => {
    if (mesaEditar) {
      setFormData({
        id_mesa: mesaEditar.id_mesa,
        id_sucursal: mesaEditar.id_sucursal, // Mantenemos el que tiene
        numero_mesa: mesaEditar.numero_mesa,
        capacidad: mesaEditar.capacidad,
        estado_mesa: mesaEditar.estado_mesa,
        estado: 1
      });
    } else {
      // MODO CREAR
      setFormData({
        id_sucursal: parseInt(idSucursalActual),
        numero_mesa: '',
        capacidad: 4, // Valor por defecto común
        estado_mesa: 'Disponible',
        estado: 1
      });
    }
  }, [mesaEditar, isOpen, idSucursalActual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Capacidad debe ser número
    const val = name === 'capacidad' ? parseInt(value) : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm border border-coffee-800/20">
        
        <h2 className="text-2xl font-bold text-coffee-900 mb-6">
          {mesaEditar ? 'Editar Mesa' : 'Nueva Mesa'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* NÚMERO DE MESA */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Número / Código</label>
            <input 
              name="numero_mesa" 
              value={formData.numero_mesa} 
              onChange={handleChange} 
              placeholder="Ej: 10, A1, Barra..."
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500" 
              required 
            />
          </div>

          {/* CAPACIDAD */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Capacidad (Personas)</label>
            <input 
              type="number"
              name="capacidad" 
              value={formData.capacidad} 
              onChange={handleChange} 
              min="1"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500" 
              required 
            />
          </div>

          {/* ESTADO */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Estado Actual</label>
            <select
              name="estado_mesa"
              value={formData.estado_mesa}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-terracotta-500"
            >
              <option value="Disponible">🟢 Disponible</option>
              <option value="Ocupada">🔴 Ocupada</option>
              <option value="Reservada">🟡 Reservada</option>
              <option value="Mantenimiento">🔧 Mantenimiento</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded shadow transition font-bold">
                Guardar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}