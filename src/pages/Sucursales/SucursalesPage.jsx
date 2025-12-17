import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { Pencil, Trash2, ArrowRightCircle } from 'lucide-react'; // <--- ICONOS NUEVOS

import { sucursalesService } from '../../services/sucursalesService';
import { restaurantesService } from '../../services/restaurantesService';
import { SucursalModal } from './SucursalModal';
import { ConfirmModal } from './ConfirmModal'; // Asumo que ya moviste o creaste este archivo

export function SucursalesPage() {
  const [sucursales, setSucursales] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados Modal Formulario (Crear/Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sucursalEditar, setSucursalEditar] = useState(null);

  // Estados Modal Confirmación (Eliminar)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    // Cargamos Sucursales y Restaurantes al mismo tiempo
    const [listaSucursales, listaRestaurantes] = await Promise.all([
      sucursalesService.listarTodos(),
      restaurantesService.listarTodos()
    ]);
    
    setSucursales(listaSucursales);
    setRestaurantes(listaRestaurantes);
    setCargando(false);
  };

  const getNombreRestaurante = (id) => {
      const rest = restaurantes.find(r => r.idRestaurante === id);
      return rest ? rest.nombre : 'Desconocido (ID ' + id + ')';
  };

  const abrirModalCrear = () => {
      setSucursalEditar(null);
      setIsModalOpen(true); 
  };

  const abrirModalEditar = (sucursal) => {
      setSucursalEditar(sucursal);
      setIsModalOpen(true); 
  };

  // --- LÓGICA DE GUARDAR CON NOTIFICACIÓN ---
  const guardarSucursal = async (datos) => {
      // Mostramos notificación de carga
      const toastId = toast.loading('Guardando cambios...');

      let resultado;
      if (datos.idSucursal) {
        resultado = await sucursalesService.actualizar(datos);
      } else {
        resultado = await sucursalesService.crear(datos);
      }
      
      if(resultado) { 
          cargarDatos(); 
          setIsModalOpen(false);
          // Actualizamos la notificación a ÉXITO
          toast.success('¡Sucursal guardada correctamente!', { id: toastId });
      } else {
          // Actualizamos la notificación a ERROR
          toast.error('Hubo un error al guardar', { id: toastId });
      }
  };

  const entrarASucursal = (id) => navigate(`/sucursal/${id}/dashboard`);


  // --- LÓGICA DE ELIMINAR CON NOTIFICACIÓN ---
  
  const solicitarEliminar = (id) => {
    setIdToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (idToDelete) {
      // Notificación de carga
      const toastId = toast.loading('Eliminando sucursal...');
      
      const exito = await sucursalesService.eliminar(idToDelete);
      
      if (exito) {
          cargarDatos();
          toast.success('¡Eliminado correctamente!', { id: toastId });
      } else {
          toast.error('No se pudo eliminar el registro', { id: toastId });
      }
    }
    setIsDeleteOpen(false); 
    setIdToDelete(null); 
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-coffee-900">Sucursales</h2>
          <p className="text-coffee-800 opacity-70 mt-1">Gestión de tus locales</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition">
          + Nueva Sucursal
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-md border border-coffee-800/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-coffee-900 text-cream-100">
                <tr>
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Restaurante</th>
                    <th className="p-4 font-semibold">Nombre Sucursal</th>
                    <th className="p-4 font-semibold">Dirección</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-coffee-800/10">
                {cargando && <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando datos...</td></tr>}

                {!cargando && sucursales.map((sucursal) => (
                    <tr key={sucursal.idSucursal} className="hover:bg-cream-200/50 transition">
                        <td className="p-4 text-coffee-800 font-mono text-sm">#{sucursal.idSucursal}</td>
                        <td className="p-4 text-terracotta-600 font-semibold text-sm">{getNombreRestaurante(sucursal.idRestaurante)}</td>
                        <td className="p-4 text-coffee-900 font-bold">{sucursal.nombre}</td>
                        <td className="p-4 text-coffee-800 opacity-80 text-sm">{sucursal.direccion}</td>
                        
                        {/* AQUÍ ESTÁN TUS ICONOS NUEVOS */}
                        <td className="p-4 flex justify-center gap-2 items-center">
                            
                            <button 
                                onClick={() => entrarASucursal(sucursal.idSucursal)}
                                className="flex items-center gap-1 bg-coffee-900 hover:bg-coffee-800 text-cream-100 text-xs py-1 px-3 rounded shadow transition"
                            >
                                <span>Entrar</span> <ArrowRightCircle size={14} />
                            </button>

                            <div className="h-4 w-px bg-gray-300 mx-2"></div>

                            <button 
                                onClick={() => abrirModalEditar(sucursal)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                title="Editar"
                            >
                                <Pencil size={18} />
                            </button>
                            
                            <button 
                                onClick={() => solicitarEliminar(sucursal.idSucursal)} 
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                title="Eliminar"
                            >
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODAL DE FORMULARIO (CREAR/EDITAR) */}
      <SucursalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={guardarSucursal}
        sucursalEditar={sucursalEditar}
        listaRestaurantes={restaurantes}
      />

      {/* MODAL DE CONFIRMACIÓN (ELIMINAR) */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmarEliminacion}
        mensaje="¿Estás seguro de que deseas eliminar esta sucursal? Esta acción borrará sus datos."
      />

    </div>
  );
}