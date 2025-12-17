import { BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/pedidos`; 
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMWUyMTRiNTVhMjIxNGI4NGJkNjljMzYzODRlMDBiYmVhZmM2MDA4N2E0NmNlNjUwNWI4ZTg4MWFmNWM5Y2VlIiwiaWF0IjoxNzYzMDAxMDIzLCJleHAiOjQ4Mzg4NDEwMjN9.BKcBUQSR5sisVCSWI16ii6WLoPBk3m4Lx_zMtIBH51I";

export const pedidosService = {
  
  listarTodos: async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // ESTE ES EL QUE CREA EL PEDIDO
  crear: async (datos) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(datos)
    });
    
    // Si el backend responde error (ej: 400 Bad Request), lanzamos error
    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Error al crear pedido');
    }
    return await response.json();
  },

  actualizar: async (datos) => {
    // ... (tu código de actualizar estado que ya funcionaba)
    const id = datos.id_pedido || datos.idPedido;
    const nuevoEstado = datos.estado_pedido || datos.estadoPedido;
    const response = await fetch(`${API_URL}/${id}/estado`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
        body: JSON.stringify(nuevoEstado)
    });
    if (!response.ok) throw new Error('Error al actualizar estado');
    return await response.json();
  },

  eliminar: async (id) => {
    // ... (tu código de cancelar que ya funcionaba)
    const response = await fetch(`${API_URL}/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
        body: JSON.stringify("Cancelado")
    });
    if (!response.ok) throw new Error('Error al cancelar pedido');
    return true;
  }
};