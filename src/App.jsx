import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

// Importamos páginas
import { SesionesPage } from './pages/Sesiones/SesionesPage';
import { MovimientosPage } from './pages/Movimientos/MovimientosPage';
import { ClientesPage } from './pages/Clientes/ClientesPage';
import { VentasPage } from './pages/Ventas/VentasPage';
import { MesasPage } from './pages/Mesas/MesasPage';
import { PedidosPage } from './pages/Pedidos/PedidosPage';
import { CajaPage } from './pages/Caja/CajaPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { SucursalesPage } from './pages/Sucursales/SucursalesPage';

// Importamos layouts
import AdminLayout from './layouts/AdminLayout';
import { SucursalLayout } from './layouts/SucursalLayout';

function App() {
  return (
    <HashRouter>
      {/* Notificaciones */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#3E2723', 
            color: '#FFF8E7',
          }
        }}
      />

      <Routes>
        {/* RUTA SUPER ADMIN */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<SucursalesPage />} />
        </Route>

        {/* RUTA SUCURSAL */}
        <Route path="/sucursal/:id" element={<SucursalLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="mesas" element={<MesasPage />} />
          <Route path="pedidos" element={<PedidosPage />} />
          <Route path="sesiones" element={<SesionesPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="caja" element={<CajaPage />} />
          <Route path="movimientos" element={<MovimientosPage />} />
          <Route path="ventas" element={<VentasPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
