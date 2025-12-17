import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';

import { pedidosService } from '../../services/pedidosService';
import { mesasService } from '../../services/mesasService';
import { PedidosModal } from './PedidosModal';
import { ConfirmModal } from '../Sucursales/ConfirmModal';

export function PedidosPage() {
  const { id } = useParams(); 
  
  const [pedidos, setPedidos] = useState([]);
  const [mesasSucursal, setMesasSucursal] = useState([]); 
  const [cargando, setCargando] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pedidoEditar, setPedidoEditar] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  useEffect(() => { cargarDatos(); }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
        const [todosPedidos, todasMesas] = await Promise.all([
            pedidosService.listarTodos(),
            mesasService.listarTodas()
        ]);

        // 1. Filtrar Mesas
        const mesasFiltradas = todasMesas.filter(m => {
            const sID = typeof m.id_sucursal === 'object' ? m.id_sucursal?.idSucursal : m.id_sucursal;
            return String(sID) === String(id);
        });
        setMesasSucursal(mesasFiltradas);
        const idsMesasValidas = mesasFiltradas.map(m => String(m.id_mesa));

        // 2. Filtrar Pedidos
        const pedidosFiltrados = todosPedidos.filter(p => {
            const idMesa = p.id_mesa || (p.mesa ? p.mesa.id_mesa : null);
            return idMesa && idsMesasValidas.includes(String(idMesa));
        });

        setPedidos(pedidosFiltrados);

    } catch (error) {
        console.error(error);
        toast.error("Error cargando datos");
    }
    setCargando(false);
  };

  // --- SOLUCIÓN VISUAL MESA ---
  const getNumeroMesa = (pedido) => {
      const idMesa = pedido.id_mesa || (pedido.mesa ? pedido.mesa.id_mesa : null);
      const mesa = mesasSucursal.find(m => String(m.id_mesa) === String(idMesa));
      return mesa ? mesa.numero_mesa : '?';
  };

  const guardarPedido = async (datos) => {
    const toastId = toast.loading('Procesando...');
    try {
        let resultado;
        if (datos.id_pedido) {
            resultado = await pedidosService.actualizar(datos);
        } else {
            resultado = await pedidosService.crear(datos);
        }
        
        if(resultado) {
            await cargarDatos();
            setIsModalOpen(false);
            toast.success('¡Operación Exitosa!', { id: toastId });
        }
    } catch (error) {
        toast.error('Error: ' + error.message, { id: toastId });
    }
  };

  const confirmarCancelacion = async () => {
    if (idToDelete) {
        const toastId = toast.loading('Cancelando pedido...');
        try {
            // Esto llamará al endpoint de estado poniéndolo en "Cancelado"
            await pedidosService.eliminar(idToDelete); 
            await cargarDatos();
            toast.success('¡Pedido Cancelado!', { id: toastId });
        } catch (error) {
            toast.error('Error al cancelar', { id: toastId });
        }
    }
    setIsDeleteOpen(false);
    setIdToDelete(null);
  };

  const abrirModalCrear = () => { 
      if(mesasSucursal.length === 0) return toast.error('No hay mesas.');
      setPedidoEditar(null); setIsModalOpen(true); 
  };
  const abrirModalEditar = (p) => { setPedidoEditar(p); setIsModalOpen(true); };

  const getBadgeEstado = (estado) => {
      const st = String(estado || '').toLowerCase();
      if(st.includes('cancel')) return 'bg-red-100 text-red-800 border-red-200';
      if(st.includes('entregado')) return 'bg-green-100 text-green-800 border-green-200';
      if(st.includes('listo')) return 'bg-blue-100 text-blue-800 border-blue-200';
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-coffee-900">Comandas / Pedidos</h2>
          <p className="text-coffee-800 opacity-70 mt-1">Control de cocina y mesas</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition">
          + Nuevo Pedido
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-coffee-800/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-coffee-900 text-cream-100">
                <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Mesa</th>
                    <th className="p-4">Detalle</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4">Hora</th>
                    <th className="p-4 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-coffee-800/10">
                {!cargando && pedidos.map((p) => (
                    <tr key={p.id_pedido} className={`hover:bg-cream-200/50 transition ${p.estado_pedido === 'Cancelado' ? 'opacity-50' : ''}`}>
                        <td className="p-4 text-sm font-mono">#{p.id_pedido}</td>
                        <td className="p-4 font-bold text-lg">Mesa {getNumeroMesa(p)}</td>
                        <td className="p-4 max-w-xs truncate">{p.notas}</td>
                        <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeEstado(p.estado_pedido)}`}>
                                {p.estado_pedido}
                            </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                             {p.fecha_hora ? new Date(p.fecha_hora).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                             <button onClick={() => abrirModalEditar(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Actualizar Estado">
                                <Pencil size={18}/>
                             </button>
                             {/* Solo mostramos botón eliminar si no está cancelado ya */}
                             {p.estado_pedido !== 'Cancelado' && (
                                <button onClick={() => { setIdToDelete(p.id_pedido); setIsDeleteOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Cancelar Pedido">
                                    <Trash2 size={18}/>
                                </button>
                             )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      <PedidosModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        onSave={guardarPedido} pedidoEditar={pedidoEditar} listaMesas={mesasSucursal} 
      />

      <ConfirmModal
        isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmarCancelacion}
        mensaje="¿Desea CANCELAR este pedido? (No se borrará, cambiará a estado Cancelado)"
      />
    </div>
  );
}