import { useEffect, useState } from 'react';

export function ClientesModal({ isOpen, onClose, onSave, clienteEditar, idRestauranteActual }) {
  
  const [formData, setFormData] = useState({
    tipoCliente: 'Persona',
    nombreRazonSocial: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    estado: 1
  });

  useEffect(() => {
    if (clienteEditar) {
      // MODO EDICIÓN
      setFormData({
        idCliente: clienteEditar.idCliente,
        idRestaurante: clienteEditar.idRestaurante,
        tipoCliente: clienteEditar.tipoCliente,
        nombreRazonSocial: clienteEditar.nombreRazonSocial,
        documento: clienteEditar.documento,
        email: clienteEditar.email,
        telefono: clienteEditar.telefono,
        direccion: clienteEditar.direccion,
        estado: 1
      });
    } else {
      // MODO CREACIÓN
      setFormData({
        idRestaurante: idRestauranteActual, // ASIGNAMOS EL RESTAURANTE AUTOMÁTICAMENTE
        tipoCliente: 'Persona',
        nombreRazonSocial: '',
        documento: '',
        email: '',
        telefono: '',
        direccion: '',
        estado: 1
      });
    }
  }, [clienteEditar, isOpen, idRestauranteActual]);

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
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-coffee-800/20 max-h-[90vh] overflow-y-auto">
        
        <h2 className="text-2xl font-bold text-coffee-900 mb-6">
          {clienteEditar ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* TIPO CLIENTE */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Tipo de Cliente</label>
            <select
              name="tipoCliente"
              value={formData.tipoCliente}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500 bg-white"
            >
              <option value="Persona">Persona Natural</option>
              <option value="Empresa">Empresa</option>
            </select>
          </div>

          {/* NOMBRE / RAZÓN SOCIAL */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Nombre / Razón Social</label>
            <input 
              name="nombreRazonSocial" 
              value={formData.nombreRazonSocial} 
              onChange={handleChange} 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500" 
              required 
            />
          </div>

          {/* DOCUMENTO Y TELÉFONO (EN FILA) */}
          <div className="flex gap-4">
            <div className="w-1/2">
                <label className="text-sm font-semibold text-coffee-800">
                    {formData.tipoCliente === 'Persona' ? 'DNI' : 'RUC'}
                </label>
                <input 
                  name="documento" 
                  value={formData.documento} 
                  onChange={handleChange} 
                  maxLength={formData.tipoCliente === 'Persona' ? 8 : 11}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500" 
                  required 
                />
            </div>
            <div className="w-1/2">
                <label className="text-sm font-semibold text-coffee-800">Teléfono</label>
                <input 
                  name="telefono" 
                  value={formData.telefono} 
                  onChange={handleChange} 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500" 
                />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Email</label>
            <input 
              type="email"
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500" 
            />
          </div>

          {/* DIRECCIÓN */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Dirección</label>
            <input 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleChange} 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-terracotta-500" 
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