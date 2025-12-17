import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Lock, Trash2 } from 'lucide-react'; // <--- ICONOS NUEVOS

import { sesionesService } from '../../services/sesionesService';
import { SesionesModal } from './SesionesModal';
import { ConfirmModal } from '../Sucursales/ConfirmModal';

export function SesionesPage() {
  const { id } = useParams(); // ID Sucursal
  
  const [sesiones, setSesiones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sesionEditar, setSesionEditar] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    const todos = await sesionesService.listarTodos();
    
    // Filtrar sesiones de ESTA sucursal (Manejando tipos de datos)
    const filtrados = todos.filter(s => String(s.idSucursal) === String(id));
    
    setSesiones(filtrados);
    setCargando(false);
  };

  const abrirModalCrear = () => {
    setSesionEditar(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (sesion) => {
    setSesionEditar(sesion);
    setIsModalOpen(true);
  };

  const guardarSesion = async (datos) => {
    const toastId = toast.loading('Procesando...');
    let resultado;

    if (datos.idSesion) {
        resultado = await sesionesService.actualizar(datos);
    } else {
        resultado = await sesionesService.crear(datos);
    }

    if(resultado) {
        cargarDatos();
        setIsModalOpen(false);
        toast.success('¡Operación exitosa!', { id: toastId });
    } else {
        toast.error('Error al procesar', { id: toastId });
    }
  };

  const confirmarEliminacion = async () => {
    if (idToDelete) {
        const toastId = toast.loading('Eliminando...');
        const exito = await sesionesService.eliminar(idToDelete);
        if (exito) {
            cargarDatos();
            toast.success('¡Sesión eliminada!', { id: toastId });
        } else {
            toast.error('Error al eliminar', { id: toastId });
        }
    }
    setIsDeleteOpen(false);
    setIdToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-coffee-900">Sesiones de Caja</h2>
          <p className="text-coffee-800 opacity-70 mt-1">Historial de aperturas y cierres</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition">
          + Abrir Caja
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-coffee-800/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-coffee-900 text-cream-100">
                <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Inicio</th>
                    <th className="p-4">Fin Real</th>
                    <th className="p-4">Diferencia</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-coffee-800/10">
                {!cargando && sesiones.map((sesion) => (
                    <tr key={sesion.idSesion} className="hover:bg-cream-200/50 transition">
                        <td className="p-4 text-sm font-mono text-coffee-800">#{sesion.idSesion}</td>
                        <td className="p-4 font-bold text-green-700">S/ {sesion.montoInicial}</td>
                        <td className="p-4 font-bold text-blue-700">
                            {sesion.montoFinalReal ? `S/ ${sesion.montoFinalReal}` : '-'}
                        </td>
                        <td className={`p-4 font-bold ${sesion.diferencia < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {sesion.diferencia ? `S/ ${sesion.diferencia}` : '-'}
                        </td>
                        <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${sesion.montoFinalReal ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}>
                                {sesion.montoFinalReal ? 'CERRADO' : 'ABIERTO'}
                            </span>
                        </td>
                        
                        {/* --- AQUÍ ESTÁN LOS ICONOS NUEVOS --- */}
                        <td className="p-4 flex justify-center gap-2 items-center">
                            <button 
                                onClick={() => abrirModalEditar(sesion)} 
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm hover:bg-blue-50 px-2 py-1 rounded transition"
                                title={sesion.montoFinalReal ? 'Ver detalles' : 'Cerrar caja'}
                            >
                                {/* ÍCONO DINÁMICO: Ojo si está cerrado, Candado si está abierto */}
                                {sesion.montoFinalReal ? <Eye size={18} /> : <Lock size={18} />}
                                <span className="hidden md:inline">{sesion.montoFinalReal ? 'Ver' : 'Cerrar'}</span>
                            </button>

                            <button 
                                onClick={() => { setIdToDelete(sesion.idSesion); setIsDeleteOpen(true); }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                title="Eliminar"
                            >
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
                {!cargando && sesiones.length === 0 && (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No hay sesiones en esta sucursal.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      <SesionesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={guardarSesion}
        sesionEditar={sesionEditar}
        idSucursalActual={id}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmarEliminacion}
        mensaje="¿Borrar esta sesión? Se perderá el historial de caja."
      />
    </div>
  );
}