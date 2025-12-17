import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

// Importamos los 3 servicios necesarios para calcular
import { sesionesService } from '../../services/sesionesService';
import { ventasService } from '../../services/ventasService';
import { movimientosService } from '../../services/movimientosService';

export function CajaPage() {
  const { id } = useParams(); // ID Sucursal
  const [cargando, setCargando] = useState(true);
  
  // Estado para guardar los totales calculados
  const [resumen, setResumen] = useState({
    sesionActiva: null,
    montoInicial: 0,
    ventasEfectivo: 0,
    ventasDigital: 0,
    ingresosExtra: 0,
    egresos: 0,
    saldoFisico: 0, // Lo que debe haber en el cajón billete sobre billete
    saldoTotalVentas: 0 // Cuánto se vendió en total (incluyendo tarjetas)
  });

  useEffect(() => {
    calcularCaja();
  }, [id]);

  const calcularCaja = async () => {
    setCargando(true);
    try {
        // 1. CARGAMOS TODO EN PARALELO
        const [todasSesiones, todasVentas, todosMovimientos] = await Promise.all([
            sesionesService.listarTodos(),
            ventasService.listarTodos(),
            movimientosService.listarTodos()
        ]);

        // 2. BUSCAMOS LA SESIÓN ACTIVA (ABIERTA) DE ESTA SUCURSAL
        const sesionActual = todasSesiones.find(s => 
            String(s.idSucursal) === String(id) && !s.montoFinalReal
        );

        if (!sesionActual) {
            setResumen(prev => ({ ...prev, sesionActiva: null }));
            setCargando(false);
            return;
        }

        // 3. FILTRAMOS VENTAS Y MOVIMIENTOS DE *ESTA* SESIÓN
        const ventasDeSesion = todasVentas.filter(v => v.idSesion === sesionActual.idSesion && v.estado === 1);
        const movsDeSesion = todosMovimientos.filter(m => m.idSesion === sesionActual.idSesion);

        // 4. CALCULAMOS TOTALES
        let totalEfectivo = 0;
        let totalDigital = 0;

        ventasDeSesion.forEach(v => {
            const monto = parseFloat(v.montoTotal) || 0;
            if (v.metodoPago === 'Efectivo') {
                totalEfectivo += monto;
            } else {
                totalDigital += monto;
            }
        });

        let totalIngresosExtra = 0;
        let totalEgresos = 0;

        movsDeSesion.forEach(m => {
            const monto = parseFloat(m.monto) || 0;
            if (m.tipoMovimiento === 'Ingreso') {
                totalIngresosExtra += monto;
            } else {
                totalEgresos += monto;
            }
        });

        // 5. CÁLCULO FINAL (Matemática simple)
        // Saldo Físico = Inicial + Ventas Efectivo + Ingresos Extra - Gastos
        const saldoFisicoCalculado = parseFloat(sesionActual.montoInicial) + totalEfectivo + totalIngresosExtra - totalEgresos;

        setResumen({
            sesionActiva: sesionActual,
            montoInicial: parseFloat(sesionActual.montoInicial),
            ventasEfectivo: totalEfectivo,
            ventasDigital: totalDigital,
            ingresosExtra: totalIngresosExtra,
            egresos: totalEgresos,
            saldoFisico: saldoFisicoCalculado,
            saldoTotalVentas: totalEfectivo + totalDigital
        });

    } catch (error) {
        console.error(error);
        toast.error("Error al calcular la caja");
    }
    setCargando(false);
  };

  if (cargando) return <div className="p-10 text-center text-gray-500">Calculando billetes... 💵</div>;

  if (!resumen.sesionActiva) {
      return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="bg-red-100 p-6 rounded-full mb-4">
                  <span className="text-4xl">🔒</span>
              </div>
              <h2 className="text-2xl font-bold text-coffee-900">Caja Cerrada</h2>
              <p className="text-gray-600 mt-2">No hay ninguna sesión activa en esta sucursal.</p>
              <p className="text-sm text-gray-400">Ve a "Sesiones" para abrir caja.</p>
          </div>
      );
  }

  return (
    <div className="animate-fadeIn">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-coffee-900">Arqueo de Caja</h2>
          <p className="text-coffee-800 opacity-70 mt-1">
            Sesión #{resumen.sesionActiva.idSesion} • Usuario ID: {resumen.sesionActiva.idUsuario}
          </p>
        </div>
        <div className="text-right">
            <span className="block text-xs text-gray-500 font-bold uppercase tracking-wide">Fecha Apertura</span>
            <span className="text-coffee-900 font-mono">
                {new Date(resumen.sesionActiva.fechaApertura || new Date()).toLocaleString()}
            </span>
        </div>
      </div>

      {/* TARJETAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* 1. APERTURA */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase">Monto Inicial</p>
                <p className="text-2xl font-bold text-coffee-900 mt-1">S/ {resumen.montoInicial.toFixed(2)}</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>

        {/* 2. INGRESOS (Ventas Ef + Movimientos) */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
                <p className="text-green-600 text-xs font-bold uppercase">Entradas (Efectivo)</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                    + S/ {(resumen.ventasEfectivo + resumen.ingresosExtra).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Ventas: {resumen.ventasEfectivo.toFixed(2)} | Extras: {resumen.ingresosExtra.toFixed(2)}
                </p>
            </div>
            <span className="text-2xl">📈</span>
          </div>
        </div>

        {/* 3. SALIDAS */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
                <p className="text-red-600 text-xs font-bold uppercase">Salidas / Gastos</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                    - S/ {resumen.egresos.toFixed(2)}
                </p>
            </div>
            <span className="text-2xl">📉</span>
          </div>
        </div>

        {/* 4. SALDO FINAL (LA REINA) */}
        <div className="bg-coffee-900 p-6 rounded-xl shadow-lg text-cream-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-cream-200 text-xs font-bold uppercase tracking-wider">Debe haber en Cajón</p>
            <p className="text-4xl font-bold mt-2">S/ {resumen.saldoFisico.toFixed(2)}</p>
          </div>
          {/* Adorno de fondo */}
          <div className="absolute -right-4 -bottom-4 text-white opacity-10 text-8xl">💵</div>
        </div>

      </div>

      {/* SECCIÓN DETALLE (TARJETAS vs EFECTIVO) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Resumen de Ventas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-coffee-900 mb-4 border-b pb-2">Desglose de Ventas</h3>
              <div className="space-y-3">
                  <div className="flex justify-between items-center">
                      <span className="text-gray-600">💵 Efectivo</span>
                      <span className="font-mono font-bold">S/ {resumen.ventasEfectivo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-gray-600">💳 Tarjetas / Yape (Banco)</span>
                      <span className="font-mono font-bold text-blue-600">S/ {resumen.ventasDigital.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center mt-2">
                      <span className="font-bold text-coffee-900">Total Vendido</span>
                      <span className="font-mono font-bold text-xl text-terracotta-600">S/ {resumen.saldoTotalVentas.toFixed(2)}</span>
                  </div>
              </div>
          </div>

          {/* Accesos Rápidos */}
          <div className="bg-cream-100 p-6 rounded-xl border border-terracotta-200 flex flex-col justify-center items-center text-center">
              <h3 className="font-bold text-coffee-900 mb-2">¿Necesitas ajustar?</h3>
              <p className="text-sm text-gray-600 mb-4">Registra gastos o ingresos extra para cuadrar la caja.</p>
              <a href={`/sucursal/${id}/movimientos`} className="bg-white border border-gray-300 hover:border-terracotta-500 text-coffee-900 px-4 py-2 rounded-lg shadow-sm transition">
                  Ir a Movimientos ➜
              </a>
          </div>

      </div>
    </div>
  );
}