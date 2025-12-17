// src/services/clientesService.js
import { BASE_URL } from '../config'; // <--- IMPORTAR

// const API_URL = 'http://localhost:8080 /restful/clientes';

const API_URL = `${BASE_URL}/restful/clientes`;

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMWUyMTRiNTVhMjIxNGI4NGJkNjljMzYzODRlMDBiYmVhZmM2MDA4N2E0NmNlNjUwNWI4ZTg4MWFmNWM5Y2VlIiwiaWF0IjoxNzYzMDAxMDIzLCJleHAiOjQ4Mzg4NDEwMjN9.BKcBUQSR5sisVCSWI16ii6WLoPBk3m4Lx_zMtIBH51I";

export const clientesService = {
  
  // 1. OBTENER TODOS
  listarTodos: async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      if (!response.ok) throw new Error('Error al cargar clientes');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // 2. CREAR (POST)
  crear: async (datos) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(datos)
      });
      if (!response.ok) throw new Error('Error al crear cliente');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // 3. EDITAR (PUT) - OJO: ID en la URL según tu Postman
  actualizar: async (id, datos) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(datos)
      });
      if (!response.ok) throw new Error('Error al actualizar cliente');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // 4. ELIMINAR (DELETE)
  eliminar: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      if (!response.ok) throw new Error('Error al eliminar');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};