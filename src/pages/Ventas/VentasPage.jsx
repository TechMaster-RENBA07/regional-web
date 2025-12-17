import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Ban } from 'lucide-react';

// SERVICIOS (Asegúrate que las rutas sean correctas)
import { ventasService } from '../../services/ventasService';
import { clientesService } from '../../services/clientesService';
import { sesionesService } from '../../services/sesionesService';
import { sucursalesService } from '../../services/sucursalesService';
import { mesasService } from '../../services/mesasService';
import { pedidosService } from '../../services/pedidosService';

// COMPONENTES
import { VentasModal } from './VentasModal';
import { ConfirmModal } from '../Sucursales/ConfirmModal';

export function VentasPage() {
  const { id } = useParams(); // Este 'id' es un STRING (ej: "1")
  
  // ESTADOS
  const [ventas, setVentas] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [sesionesAbiertas, setSesionesAbiertas] = useState([]);
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [mesasSucursal, setMesasSucursal] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [errorCritico, setErrorCritico] = useState(null); // Para mostrar error en pantalla si explota

  // MODALES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ventaEditar, setVentaEditar] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    setErrorCritico(null);
    
    try {
        console.log("1. Iniciando carga de datos...");

        // Usamos Promise.allSettled para que si falla UNO, no fallen TODOS.
        const resultados = await Promise.allSettled([
            ventasService.listarTodos(),      // 0
            clientesService.listarTodos(),    // 1
            sesionesService.listarTodos(),    // 2
            sucursalesService.listarTodos(),  // 3
            mesasService.listarTodas(),       // 4
            pedidosService.listarTodos()      // 5
        ]);

        // Extraemos los datos (si falló, ponemos array vacío para no romper la web)
        const todasVentas = resultados[0].status === 'fulfilled' ? resultados[0].value : [];
        const todosClientes = resultados[1].status === 'fulfilled' ? resultados[1].value : [];
        const todasSesiones = resultados[2].status === 'fulfilled' ? resultados[2].value : [];
        const todasSucursales = resultados[3].status === 'fulfilled' ? resultados[3].value : [];
        const todasMesas = resultados[4].status === 'fulfilled' ? resultados[4].value : [];
        const todosPedidos = resultados[5].status === 'fulfilled' ? resultados[5].value : [];

        // DEBUG: Muestra en consola qué llegó realmente
        console.log("📥 DATOS RECIBIDOS DEL BACKEND:", { 
            todasVentas, todasSucursales, todasSesiones 
        });

        // -----------------------------------------------------------
        // 1. ENCONTRAR LA SUCURSAL ACTUAL
        // -----------------------------------------------------------
        // IMPORTANTE: Spring suele devolver idSucursal (camelCase), pero DB es id_sucursal.
        // Probamos ambas formas para asegurar.
        const sucursalIdNum = Number(id);
        const sucursalActual = todasSucursales.find(s => 
            (s.idSucursal == sucursalIdNum) || (s.id_sucursal == sucursalIdNum)
        );

        if (!sucursalActual) {
            console.error("❌ No se encontró la sucursal con ID:", id);
            setErrorCritico(`No se encontró la sucursal ID ${id} en la base de datos.`);
            setCargando(false);
            return;
        }

        const idRest = sucursalActual.idRestaurante || sucursalActual.id_restaurante;
        console.log("✅ Sucursal encontrada:", sucursalActual.nombre, "| ID Restaurante:", idRest);

        // -----------------------------------------------------------
        // 2. FILTRAR DATOS
        // -----------------------------------------------------------

        // A. Clientes (Filtrar por restaurante)
        setClientesFiltrados(todosClientes.filter(c => {
            const rID = c.idRestaurante || c.id_restaurante;
            return rID == idRest;
        }));

        // B. Sesiones (Filtrar por sucursal)
        const sesionesDeEstaSucursal = todasSesiones.filter(s => {
            const sID = s.idSucursal || s.id_sucursal;
            return sID == sucursalIdNum;
        });
        // Sesiones abiertas (sin fecha cierre o sin monto final)
        setSesionesAbiertas(sesionesDeEstaSucursal.filter(s => !s.montoFinalReal));
        
        // Guardamos los IDs de sesiones históricas para filtrar ventas
        const idsSesionesHistorial = sesionesDeEstaSucursal.map(s => s.idSesion || s.id_sesion);

        // C. Ventas (Filtrar las que pertenezcan a sesiones de esta sucursal)
        const ventasFiltradas = todasVentas.filter(v => {
            // El backend devuelve 'idSesion' (ver tu Postman)
            const vSesionId = v.idSesion || v.id_sesion; 
            return idsSesionesHistorial.includes(vSesionId);
        });
        setVentas(ventasFiltradas);

        // D. Mesas y Pedidos (Para el modal de nueva venta)
        const mesasDeAqui = todasMesas.filter(m => {
             // A veces mesa trae objeto sucursal completo, a veces solo ID
             const sID = (typeof m.idSucursal === 'object') ? m.idSucursal?.idSucursal : (m.idSucursal || m.id_sucursal);
             const sID_alt = (typeof m.id_sucursal === 'object') ? m.id_sucursal?.idSucursal : m.id_sucursal;
             return (sID == sucursalIdNum) || (sID_alt == sucursalIdNum);
        });
        setMesasSucursal(mesasDeAqui);
        const idsMesas = mesasDeAqui.map(m => m.idMesa || m.id_mesa);

        // Pedidos pendientes de cobro
        const pendientes = todosPedidos.filter(p => {
            const mID = (typeof p.idMesa === 'object') ? p.idMesa?.idMesa : (p.idMesa || p.id_mesa);
            // Filtrar por mesa de esta sucursal Y que no esté pagado
            return idsMesas.includes(mID) && p.estado !== 0 && p.estadoPedido !== 'Pagado';
        });
        setPedidosPendientes(pendientes);

    } catch (error) {
        console.error("❌ Error CRÍTICO en carga de datos:", error);
        setErrorCritico("Error cargando datos: " + error.message);
    } finally {
        setCargando(false);
    }
  };

  // HELPERS SEGUROS (Con ? para evitar crash si es null)
  const getNombreCliente = (idCliente) => {
    const c = clientesFiltrados.find(cl => (cl.idCliente || cl.id_cliente) === idCliente);
    return c ? (c.nombreRazonSocial || c.nombre_razon_social) : 'Cliente General';
  };

  // ... (TUS FUNCIONES DE MODAL: abrirModalCrear, guardarVenta, ETC. MANTENLAS IGUAL) ...
  // Solo copio las necesarias para que no crashee al renderizar
  const abrirModalCrear = () => { 
      if (sesionesAbiertas.length === 0) return toast.error('DEBES ABRIR CAJA PRIMERO');
      setVentaEditar(null); setIsModalOpen(true); 
  };
  const abrirModalEditar = (v) => { setVentaEditar(v); setIsModalOpen(true); };
  
  const guardarVenta = async (datos) => {
      // Tu lógica de guardar aquí...
      // Recuerda usar ventasService.crear(datos)
      try {
        if(datos.idVenta) await ventasService.actualizar(datos);
        else await ventasService.crear(datos);
        cargarDatos();
        setIsModalOpen(false);
        toast.success("Operación exitosa");
      } catch(e) { toast.error("Error al guardar"); }
  };
  const confirmarEliminacion = async () => {
      if(idToDelete) { await ventasService.eliminar(idToDelete); cargarDatos(); }
      setIsDeleteOpen(false);
  };


  // RENDERIZADO
  if (cargando) return <div className="p-10 text-center">Cargando datos del sistema...</div>;
  
  if (errorCritico) return (
      <div className="p-10 text-center text-red-600 bg-red-100 border border-red-300 rounded m-5">
          <h3 className="font-bold text-lg">Error de Carga</h3>
          <p>{errorCritico}</p>
          <button onClick={cargarDatos} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Reintentar</button>
      </div>
  );

  return (
    <div className="p-6"> {/* Agregamos padding para asegurar visibilidad */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-coffee-900">Registro de Ventas</h2>
          <p className="text-coffee-800 opacity-70 mt-1">Facturación y boletas</p>
        </div>
        
        {sesionesAbiertas.length > 0 ? (
            <button onClick={abrirModalCrear} className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition">
            + Nueva Venta
            </button>
        ) : (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg border border-red-300 text-sm font-bold flex items-center gap-2">
                <span>🔒</span> Caja Cerrada
            </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-coffee-800/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-coffee-900 text-cream-100">
                <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Comprobante</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Método</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-coffee-800/10">
                {ventas.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No hay ventas registradas para esta sucursal.</td></tr>
                ) : (
                    ventas.map((venta) => (
                        <tr key={venta.idVenta || venta.id_venta} className="hover:bg-cream-200/50 transition">
                            <td className="p-4 text-sm font-mono text-coffee-800">#{venta.idVenta || venta.id_venta}</td>
                            <td className="p-4">
                                <span className="bg-gray-100 text-coffee-900 px-2 py-1 rounded text-xs font-bold border border-gray-300">
                                    {venta.tipoComprobante} {venta.serieComprobante}-{venta.numeroComprobante}
                                </span>
                            </td>
                            <td className="p-4 text-coffee-900 font-medium">
                                {getNombreCliente(venta.idCliente || venta.id_cliente)}
                            </td>
                            <td className="p-4">
                                <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                                    {venta.metodoPago}
                                </span>
                            </td>
                            <td className="p-4 text-right font-bold text-lg text-terracotta-600">
                                S/ {parseFloat(venta.montoTotal).toFixed(2)}
                            </td>
                            <td className="p-4 flex justify-center gap-2 items-center">
                                {/* Verificamos el estado: 1 = Activo, 0 = Anulado */}
                                {venta.estado === 1 ? (
                                    <>
                                        {/* BOTÓN EDITAR */}
                                        <button 
                                            onClick={() => abrirModalEditar(venta)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                            title="Editar Venta"
                                        >
                                            <Pencil size={18}/>
                                        </button>

                                        {/* BOTÓN ELIMINAR / ANULAR */}
                                        <button 
                                            onClick={() => {
                                                // Importante: Usamos el ID seguro que definimos antes
                                                const idSeguro = venta.idVenta || venta.id_venta;
                                                setIdToDelete(idSeguro); 
                                                setIsDeleteOpen(true); 
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                            title="Anular Venta"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </>
                                ) : (
                                    /* SI ESTÁ ANULADA, MOSTRAMOS ETIQUETA */
                                    <span className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-100">
                                        <Ban size={14} /> ANULADO
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      <VentasModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={guardarVenta}
        ventaEditar={ventaEditar}
        listaClientes={clientesFiltrados}
        listaSesiones={sesionesAbiertas}
        listaPedidos={pedidosPendientes}
      />
      
      <ConfirmModal 
         isOpen={isDeleteOpen}
         onClose={() => setIsDeleteOpen(false)}
         onConfirm={confirmarEliminacion}
         mensaje="¿Anular venta?"
      />
    </div>
  );
}