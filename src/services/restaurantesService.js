/* // src/services/restaurantesService.js

import { BASE_URL } from '../config'; // <--- IMPORTAR

// const API_URL = 'http://localhost:8080/api/restaurantes';
const API_URL = `${BASE_URL}/api/restaurantes`; 

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMWUyMTRiNTVhMjIxNGI4NGJkNjljMzYzODRlMDBiYmVhZmM2MDA4N2E0NmNlNjUwNWI4ZTg4MWFmNWM5Y2VlIiwiaWF0IjoxNzYzMDAxMDIzLCJleHAiOjQ4Mzg4NDEwMjN9.BKcBUQSR5sisVCSWI16ii6WLoPBk3m4Lx_zMtIBH51I";

// DATOS DE RESPALDO (Por si el servidor falla)
const RESTAURANTES_FAKE = [
    { idRestaurante: 1, nombre: "La Leña" },
    { idRestaurante: 2, nombre: "Restaurante Central" },
    { idRestaurante: 3, nombre: "Pardo's Chicken" },
    { idRestaurante: 4, nombre: "Bembos" },
    { idRestaurante: 5, nombre: "Siete Sopas" }
];

export const restaurantesService = {
  listarTodos: async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      
      if (!response.ok) {
        console.warn("Fallo al cargar restaurantes reales, usando datos simulados.");
        throw new Error('Error al cargar restaurantes');
      }
      
      // Intentamos mapear los datos reales
      const datos = await response.json();
      
      // AJUSTE: Tu backend devuelve "razon_social", pero tu frontend espera "nombre"
      // Hacemos una conversión rápida aquí:
      return datos.map(r => ({
          idRestaurante: r.idRestaurante,
          nombre: r.razon_social // Usamos la razón social como nombre
      }));

    } catch (error) {
      console.error("Usando datos fake por error en servidor:", error);
      // AQUÍ LA MAGIA: Si falla, devolvemos la lista falsa para que no se rompa tu vista
      return RESTAURANTES_FAKE;
    }
  }
} */;

// src/services/restaurantesService.js
import { BASE_URL } from '../config'; 

const API_URL = `${BASE_URL}/api/restaurantes`;
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMWUyMTRiNTVhMjIxNGI4NGJkNjljMzYzODRlMDBiYmVhZmM2MDA4N2E0NmNlNjUwNWI4ZTg4MWFmNWM5Y2VlIiwiaWF0IjoxNzYzMDAxMDIzLCJleHAiOjQ4Mzg4NDEwMjN9.BKcBUQSR5sisVCSWI16ii6WLoPBk3m4Lx_zMtIBH51I";

// RESPALDO
const RESTAURANTES_FAKE = [
    { idRestaurante: 1, nombre: "La Leña" },
    { idRestaurante: 2, nombre: "Restaurante Central" },
    { idRestaurante: 3, nombre: "Pardo's Chicken" },
    { idRestaurante: 4, nombre: "Bembos" }
];

export const restaurantesService = {
  listarTodos: async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      
      if (!response.ok) throw new Error('Error backend');
      
      const datos = await response.json();
      
      // --- CORRECCIÓN AQUÍ ---
      // Convertimos lo que llegue del backend a un formato estándar para React
      return datos.map(r => ({
          // Intentamos leer idRestaurante O id_restaurante
          idRestaurante: r.idRestaurante || r.id_restaurante, 
          // Intentamos leer nombre O razon_social
          nombre: r.nombre || r.razon_social || "Restaurante Sin Nombre"
      }));

    } catch (error) {
      console.warn("⚠️ Usando restaurantes fake por error:", error);
      return RESTAURANTES_FAKE;
    }
  }
};