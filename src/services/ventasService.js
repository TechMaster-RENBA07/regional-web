import { BASE_URL } from '../config';

const API_URL = `${BASE_URL}/restful/ventas`;

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMWUyMTRiNTVhMjIxNGI4NGJkNjljMzYzODRlMDBiYmVhZmM2MDA4N2E0NmNlNjUwNWI4ZTg4MWFmNWM5Y2VlIiwiaWF0IjoxNzYzMDAxMDIzLCJleHAiOjQ4Mzg4NDEwMjN9.BKcBUQSR5sisVCSWI16ii6WLoPBk3m4Lx_zMtIBH51I";

export const ventasService = {
  
  listarTodos: async () => {
    //  código existente de listar ...
    try {
      const response = await fetch(`${API_URL}/todos`, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
      if (!response.ok) throw new Error('Error backend listar');
      return await response.json();
    } catch (error) {
      console.warn("⚠️ Error listando ventas, retornando array vacío.");
      return []; 
    }
  },

  crear: async (datos) => {
   
    // Queremos que si falla, el componente lo sepa y lance el toast.error
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(datos)
    });

    if (!response.ok) {
        // Intentamos leer el mensaje de error del backend
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se guardó en BD`);
    }

    return await response.json();
  },

  eliminar: async (id) => {
    
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      return response.ok;
  }
};