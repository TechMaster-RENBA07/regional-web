// src/services/movimientosService.js
import { BASE_URL } from '../config'; // <--- IMPORTAR

// const API_URL = 'http://localhost:8080/restful/caja/movimientos';

const API_URL = `${BASE_URL}/restful/caja/movimientos`;

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMWUyMTRiNTVhMjIxNGI4NGJkNjljMzYzODRlMDBiYmVhZmM2MDA4N2E0NmNlNjUwNWI4ZTg4MWFmNWM5Y2VlIiwiaWF0IjoxNzYzMDAxMDIzLCJleHAiOjQ4Mzg4NDEwMjN9.BKcBUQSR5sisVCSWI16ii6WLoPBk3m4Lx_zMtIBH51I";

export const movimientosService = {
  
  // 1. OBTENER TODOS
  listarTodos: async () => {
    try {
      const response = await fetch(`${API_URL}/todos`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      if (!response.ok) throw new Error('Error al cargar movimientos');
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
      if (!response.ok) throw new Error('Error al crear movimiento');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // 3. EDITAR (PUT)
  actualizar: async (datos) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT', // Usamos PUT como estándar, aunque tu postman diga POST para editar
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(datos)
      });
      if (!response.ok) throw new Error('Error al actualizar');
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