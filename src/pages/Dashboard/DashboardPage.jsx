import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ventasService } from '../../services/ventasService';
import { sesionesService } from '../../services/sesionesService';

export function DashboardPage() {
  const { id } = useParams();
  const [metricas, setMetricas] = useState({
    totalVentas: 0,
    cantidadVentas: 0,
    ticketPromedio: 0,
    cajaAbierta: false
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    // 1. Cargar Ventas y Sesiones
    const [todasVentas, todasSesiones] = await Promise.all([
      ventasService.listarTodos(),
      sesionesService.listarTodos()
    ]);

    // 2. Buscar si hay caja abierta en esta sucursal
    const sesionActiva = todasSesiones.find(s => String(s.idSucursal) === String(id) && !s.montoFinalReal);

    // 3. Filtrar ventas de esta sucursal (usando las sesiones de la sucursal)
    // Primero obtenemos todos los IDs de sesiones de esta sucursal (históricas)
    const idsSesionesSucursal = todasSesiones
        .filter(s => String(s.idSucursal) === String(id))
        .map(s => s.idSesion);

    // Filtramos las ventas
    const ventasSucursal = todasVentas.filter(v => idsSesionesSucursal.includes(v.idSesion));

    // 4. Calcular Métricas
    const total = ventasSucursal.reduce((sum, v) => sum + parseFloat(v.montoTotal || 0), 0);
    const cantidad = ventasSucursal.length;
    const promedio = cantidad > 0 ? total / cantidad : 0;

    setMetricas({
      totalVentas: total,
      cantidadVentas: cantidad,
      ticketPromedio: promedio,
      cajaAbierta: !!sesionActiva
    });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-3xl font-bold text-coffee-900 mb-2">Resumen General</h2>
      <p className="text-gray-500 mb-8">Estado actual de la sucursal</p>

      {/* METRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-terracotta-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Ventas Totales</p>
          <p className="text-3xl font-bold text-coffee-900 mt-2">S/ {metricas.totalVentas.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Transacciones</p>
          <p className="text-3xl font-bold text-coffee-900 mt-2">{metricas.cantidadVentas} <span className="text-base font-normal text-gray-400">ventas</span></p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Ticket Promedio</p>
          <p className="text-3xl font-bold text-coffee-900 mt-2">S/ {metricas.ticketPromedio.toFixed(2)}</p>
        </div>

      </div>

      {/* ESTADO DE CAJA Y ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tarjeta de Estado de Caja */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold text-coffee-900">Estado de Caja</h3>
                <p className="text-gray-500 mt-1">
                    {metricas.cajaAbierta 
                        ? "La caja se encuentra operativa recibiendo pagos." 
                        : "La caja está cerrada. No se pueden realizar ventas."}
                </p>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold text-sm ${metricas.cajaAbierta ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {metricas.cajaAbierta ? '● ABIERTA' : '● CERRADA'}
            </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="grid grid-cols-2 gap-4">
            <Link to={`/sucursal/${id}/ventas`} className="flex flex-col items-center justify-center p-6 bg-terracotta-500 text-white rounded-xl shadow hover:bg-terracotta-600 transition">
                <span className="text-2xl mb-2">🛒</span>
                <span className="font-bold">Nueva Venta</span>
            </Link>
            <Link to={`/sucursal/${id}/caja`} className="flex flex-col items-center justify-center p-6 bg-coffee-900 text-white rounded-xl shadow hover:bg-coffee-800 transition">
                <span className="text-2xl mb-2">💰</span>
                <span className="font-bold">Ver Arqueo</span>
            </Link>
        </div>

      </div>
    </div>
  );
}