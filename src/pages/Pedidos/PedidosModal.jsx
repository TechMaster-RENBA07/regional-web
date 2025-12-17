import { useEffect, useState } from 'react';

export function PedidosModal({ isOpen, onClose, onSave, pedidoEditar, listaMesas = [] }) {
  
  const [formData, setFormData] = useState({
    id_mesa: '',
    notas: ''
  });

  useEffect(() => {
    if (pedidoEditar) {
      // MODO EDICIÓN (Solo carga datos visuales, recuerda que solo actualizas estado)
      const idMesa = pedidoEditar.id_mesa || (pedidoEditar.mesa ? pedidoEditar.mesa.id_mesa : '') || '';
      setFormData({
        id_mesa: idMesa,
        notas: pedidoEditar.notas || ''
      });
    } else {
      // MODO CREAR: Selecciona la primera mesa disponible por defecto
      const primeraMesa = listaMesas.length > 0 ? listaMesas[0].id_mesa : '';
      setFormData({
        id_mesa: primeraMesa,
        notas: ''
      });
    }
  }, [pedidoEditar, isOpen, listaMesas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validar que haya mesa seleccionada
    if (!formData.id_mesa) {
        alert("Debes seleccionar una mesa");
        return;
    }

    // 2. CONSTRUIR EL OBJETO EXACTO PARA JAVA (PedidoDTO)
    const payload = {
        // Si estamos editando, mandamos el ID (aunque tu backend solo actualiza estado por ahora)
        ...(pedidoEditar && { id_pedido: pedidoEditar.id_pedido }),
        
        id_mesa: Number(formData.id_mesa),
        id_usuario: 23, // Usuario por defecto (o el que esté logueado)
        notas: formData.notas,
        
        // ¡IMPORTANTE! Enviamos detalles vacío. 
        // Si no lo envías, tu Java (for DetallePedidoDTO detDto : dto.getDetalles()) fallará.
        detalles: [] 
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-coffee-800/20">
        
        <h2 className="text-2xl font-bold text-coffee-900 mb-6">
          {pedidoEditar ? 'Ver Pedido' : 'Abrir Nuevo Pedido'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* MESA */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Mesa</label>
            <select
              name="id_mesa"
              value={formData.id_mesa}
              onChange={handleChange}
              disabled={!!pedidoEditar} // No cambiar mesa al editar
              className="w-full p-2 border border-gray-300 rounded bg-white"
              required
            >
                {listaMesas.map(m => (
                    <option key={m.id_mesa} value={m.id_mesa}>
                        Mesa {m.numero_mesa} ({m.estado_mesa || 'Disp.'})
                    </option>
                ))}
            </select>
          </div>

          {/* NOTAS GENERALES */}
          <div>
            <label className="text-sm font-semibold text-coffee-800">Notas Iniciales</label>
            <textarea 
              name="notas" 
              rows="3"
              value={formData.notas} 
              onChange={handleChange} 
              disabled={!!pedidoEditar} // El backend no tiene endpoint para editar notas aún
              placeholder="Ej: Cliente alérgico al maní..."
              className="w-full p-2 border border-gray-300 rounded resize-none" 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
            
            {/* Solo mostramos botón guardar si es nuevo pedido */}
            {!pedidoEditar ? (
                <button type="submit" className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded shadow font-bold">
                    Crear Pedido
                </button>
            ) : (
                <button type="button" onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded shadow">
                    Cerrar
                </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}