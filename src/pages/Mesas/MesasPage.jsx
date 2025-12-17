import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { mesasService } from '../../services/mesasService';
import { MesasModal } from './MesasModal';
import { ConfirmModal } from '../Sucursales/ConfirmModal';

export function MesasPage() {
  const { id } = useParams(); // ID Sucursal
  
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mesaEditar, setMesaEditar] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    const todas = await mesasService.listarTodas();
    
    // Filtrar mesas de esta sucursal (Manejando si id_sucursal es objeto o número)
    const filtradas = todas.filter(m => {
        const sID = typeof m.id_sucursal === 'object' ? m.id_sucursal?.idSucursal : m.id_sucursal;
        return sID == id;
    });
    
    // Ordenar por número de mesa
    filtradas.sort((a, b) => a.numero_mesa.localeCompare(b.numero_mesa, undefined, { numeric: true }));
    
    setMesas(filtradas);
    setCargando(false);
  };

  const guardarMesa = async (datos) => {
    const toastId = toast.loading('Guardando mesa...');
    let resultado;
    
    if (datos.id_mesa) resultado = await mesasService.actualizar(datos.id_mesa, datos); // OJO: Tu servicio pide (id, datos)
    else resultado = await mesasService.crear(datos);

    if(resultado) {
        cargarDatos();
        setIsModalOpen(false);
        toast.success('¡Mesa guardada!', { id: toastId });
    } else {
        toast.error('Error al guardar', { id: toastId });
    }
  };

  const confirmarEliminacion = async () => {
    if (idToDelete) {
        const toastId = toast.loading('Eliminando...');
        const exito = await mesasService.eliminar(idToDelete);
        if (exito) {
            cargarDatos();
            toast.success('¡Eliminada!', { id: toastId });
        } else {
            toast.error('Error: Puede tener pedidos asociados', { id: toastId });
        }
    }
    setIsDeleteOpen(false);
    setIdToDelete(null);
  };

  const abrirModalCrear = () => { setMesaEditar(null); setIsModalOpen(true); };
  const abrirModalEditar = (m) => { setMesaEditar(m); setIsModalOpen(true); };

  // Helper para color según estado
  const getColorEstado = (estado) => {
      switch(estado) {
          case 'Disponible': return 'bg-green-100 text-green-800 border-green-200';
          case 'Ocupada': return 'bg-red-100 text-red-800 border-red-200';
          case 'Reservada': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-coffee-900">Gestión de Mesas</h2>
          <p className="text-coffee-800 opacity-70 mt-1">Distribución del salón</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition">
          + Nueva Mesa
        </button>
      </div>

      {cargando ? (
          <div className="text-center py-10 text-gray-500">Cargando mesas...</div>
      ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            
            {mesas.length === 0 && (
                <div className="col-span-full text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                    No hay mesas registradas. ¡Agrega la primera!
                </div>
            )}

            {mesas.map((mesa) => (
                <div key={mesa.id_mesa} className={`bg-white rounded-xl shadow-md border-l-4 p-5 relative group transition hover:shadow-lg ${
                    mesa.estado_mesa === 'Disponible' ? 'border-green-500' : 
                    mesa.estado_mesa === 'Ocupada' ? 'border-red-500' : 'border-yellow-500'
                }`}>
                    
                    {/* Botones Flotantes (Solo visibles al pasar mouse) */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => abrirModalEditar(mesa)} className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">✏️</button>
                        <button onClick={() => { setIdToDelete(mesa.id_mesa); setIsDeleteOpen(true); }} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200">🗑️</button>
                    </div>

                    <div className="flex justify-between items-start mb-2">
                        <span className="text-4xl">🍽️</span>
                        <span className="text-xs font-mono text-gray-400">#{mesa.id_mesa}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-coffee-900 mb-1">Mesa {mesa.numero_mesa}</h3>
                    <p className="text-sm text-gray-500 mb-3">Capacidad: {mesa.capacidad} pers.</p>
                    
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getColorEstado(mesa.estado_mesa)}`}>
                        {mesa.estado_mesa}
                    </span>
                </div>
            ))}
          </div>
      )}

      <MesasModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={guardarMesa}
        mesaEditar={mesaEditar}
        idSucursalActual={id}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmarEliminacion}
        mensaje="¿Eliminar esta mesa permanentemente?"
      />
    </div>
  );
}