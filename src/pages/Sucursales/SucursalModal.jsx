import { useEffect, useState } from 'react';

// Recibimos "listaRestaurantes" como prop nueva
export function SucursalModal({ isOpen, onClose, onSave, sucursalEditar, listaRestaurantes = [] }) {
  
  const [formData, setFormData] = useState({
    idRestaurante: '', // Inicialmente vacío o el primero de la lista
    nombre: '',
    direccion: '',
    telefono: '',
    horarioAtencion: '',
    estado: 1
  });

  useEffect(() => {
    if (sucursalEditar) {
      setFormData({
        idSucursal: sucursalEditar.idSucursal,
        idRestaurante: sucursalEditar.idRestaurante,
        nombre: sucursalEditar.nombre,
        direccion: sucursalEditar.direccion || '',
        telefono: sucursalEditar.telefono || '',
        horarioAtencion: sucursalEditar.horarioAtencion || '',
        estado: 1
      });
    } else {
      // Al crear nuevo, seleccionamos el primer restaurante por defecto (si hay)
      setFormData({
        idRestaurante: listaRestaurantes.length > 0 ? listaRestaurantes[0].idRestaurante : '',
        nombre: '',
        direccion: '',
        telefono: '',
        horarioAtencion: '',
        estado: 1
      });
    }
  }, [sucursalEditar, isOpen, listaRestaurantes]);

/*   const handleChange = (e) => {
    const { name, value } = e.target;
    // idRestaurante debe ser número
    const valorFinal = name === 'idRestaurante' ? parseInt(value) : value;
    setFormData({ ...formData, [name]: valorFinal });
  }; */

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // CORRECCIÓN PARA EVITAR NaN
    let val = value;
    
    // Si el campo es numérico (como idRestaurante)...
    if (name === 'idRestaurante' || name === 'capacidad') {
        // Solo convertimos si el valor NO está vacío
        val = value === '' ? '' : parseInt(value);
    }

    setFormData({ ...formData, [name]: val });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-coffee-800/20 max-h-[90vh] overflow-y-auto">
        
        <h2 className="text-2xl font-bold text-coffee-900 mb-6">
          {sucursalEditar ? 'Editar Sucursal' : 'Nueva Sucursal'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* SELECCIONAR RESTAURANTE */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Restaurante</label>
            <select
              name="idRestaurante"
              value={formData.idRestaurante}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-terracotta-500 bg-white"
              required
            >
              <option value="" disabled>-- Selecciona un Restaurante --</option>
              {listaRestaurantes.map(rest => (
                <option key={rest.idRestaurante} value={rest.idRestaurante}>
                  {rest.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-coffee-800">Nombre Sucursal</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-terracotta-500" required />
          </div>

          <div>
            <label className="text-sm font-semibold text-coffee-800">Dirección</label>
            <input name="direccion" value={formData.direccion} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-terracotta-500" required />
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
                <label className="text-sm font-semibold text-coffee-800">Teléfono</label>
                <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
            </div>
            <div className="w-1/2">
                <label className="text-sm font-semibold text-coffee-800">Horario</label>
                <input name="horarioAtencion" value={formData.horarioAtencion} onChange={handleChange} placeholder="10am - 5pm" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-terracotta-500" />
            </div>
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