import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react'; // <--- IMPORTAMOS LOS ÍCONOS

import { movimientosService } from '../../services/movimientosService';
import { sesionesService } from '../../services/sesionesService'; 
import { MovimientosModal } from './MovimientosModal';
import { ConfirmModal } from '../Sucursales/ConfirmModal';

export function MovimientosPage() {
  const { id } = useParams(); // ID de la Sucursal (URL)
  
  const [movimientos, setMovimientos] = useState([]);
  const [sesionesDeEstaSucursal, setSesionesDeEstaSucursal] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movEditar, setMovEditar] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    
    // 1. Cargar Sesiones y Movimientos en paralelo
    const [todasSesiones, todosMovimientos] = await Promise.all([
      sesionesService.listarTodos(),
      movimientosService.listarTodos()
    ]);

    // 2. Filtrar Sesiones de ESTA sucursal ABIERTAS
    const sesionesFiltradas = todasSesiones.filter(s => 
        String(s.idSucursal) === String(id) && !s.montoFinalReal
    );
    setSesionesDeEstaSucursal(sesionesFiltradas);

    // 3. IDs de sesiones válidas (incluyendo las cerradas para historial)
    // Para la tabla queremos ver TODOS los movimientos de la sucursal, no solo los de hoy.
    const historialSesiones = todasSesiones.filter(s => String(s.idSucursal) === String(id));
    const idsSesionesHistorial = historialSesiones.map(s => s.idSesion);

    // 4. Filtrar Movimientos
    const movimientosFiltrados = todosMovimientos.filter(m => idsSesionesHistorial.includes(m.idSesion));

    setMovimientos(movimientosFiltrados);
    setCargando(false);
  };

  // --- CRUD ---
  const abrirModalCrear = () => { setMovEditar(null); setIsModalOpen(true); };
  const abrirModalEditar = (mov) => { setMovEditar(mov); setIsModalOpen(true); };

  const guardarMovimiento = async (datos) => {
    const toastId = toast.loading('Guardando...');
    let resultado;
    if (datos.idMovimientoCaja) resultado = await movimientosService.actualizar(datos);
    else resultado = await movimientosService.crear(datos);

    if(resultado) {
        cargarDatos();
        setIsModalOpen(false);
        toast.success('¡Movimiento registrado!', { id: toastId });
    } else {
        toast.error('Error al guardar', { id: toastId });
    }
  };

  const confirmarEliminacion = async () => {
    if (idToDelete) {
        const toastId = toast.loading('Eliminando...');
        const exito = await movimientosService.eliminar(idToDelete);
        if (exito) {
            cargarDatos();
            toast.success('¡Eliminado correctamente!', { id: toastId });
        } else {
            toast.error('Error al eliminar', { id: toastId });
        }
    }
    setIsDeleteOpen(false);
    setIdToDelete(null);
  };

  // Helper visual
  const esIngreso = (tipo) => tipo === 'Ingreso'; 

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-coffee-900">Movimientos de Caja</h2>
          <p className="text-coffee-800 opacity-70 mt-1">Registro de ingresos y gastos</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition">
          + Nuevo Movimiento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-coffee-800/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-coffee-900 text-cream-100">
                <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Sesión</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Concepto</th>
                    <th className="p-4 text-right">Monto</th>
                    <th className="p-4 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-coffee-800/10">
                {!cargando && movimientos.map((mov) => (
                    <tr key={mov.idMovimientoCaja} className="hover:bg-cream-200/50 transition">
                        <td className="p-4 text-sm font-mono text-coffee-800">#{mov.idMovimientoCaja}</td>
                        <td className="p-4 text-sm text-gray-500">Sesión #{mov.idSesion}</td>
                        
                        <td className="p-4 font-bold">
                            <span className={`px-2 py-1 rounded text-xs ${
                                esIngreso(mov.tipoMovimiento) 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                                {mov.tipoMovimiento}
                            </span>
                        </td>

                        <td className="p-4 text-coffee-900 font-medium">{mov.concepto}</td>
                        
                        <td className={`p-4 text-right font-bold ${
                            esIngreso(mov.tipoMovimiento) ? 'text-green-700' : 'text-red-600'
                        }`}>
                            {esIngreso(mov.tipoMovimiento) ? '+' : '-'} S/ {parseFloat(mov.monto).toFixed(2)}
                        </td>

                        {/* --- AQUÍ ESTÁN LOS ICONOS NUEVOS --- */}
                        <td className="p-4 flex justify-center gap-1 items-center">
                            <button 
                                onClick={() => abrirModalEditar(mov)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                title="Editar"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={() => { setIdToDelete(mov.idMovimientoCaja); setIsDeleteOpen(true); }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                title="Eliminar"
                            >
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
                {!cargando && movimientos.length === 0 && (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No hay movimientos registrados.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      <MovimientosModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={guardarMovimiento}
        movEditar={movEditar}
        listaSesiones={sesionesDeEstaSucursal} 
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmarEliminacion}
        mensaje="¿Eliminar este movimiento? Esto afectará el arqueo de caja."
      />
    </div>
  );
}