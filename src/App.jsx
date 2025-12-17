import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { SesionesPage } from './pages/Sesiones/SesionesPage'; // <--- IMPORTAR
import { MovimientosPage } from './pages/Movimientos/MovimientosPage'; // <--- IMPORTAR
import { ClientesPage } from './pages/Clientes/ClientesPage';
import { VentasPage } from './pages/Ventas/VentasPage';
import { MesasPage } from './pages/Mesas/MesasPage';
import { PedidosPage } from './pages/Pedidos/PedidosPage';
import { CajaPage } from './pages/Caja/CajaPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';

// Importamos PÁGINAS
import { SucursalesPage } from './pages/Sucursales/SucursalesPage';

// Importamos LAYOUTS
// AdminLayout va SIN llaves porque es export default
import AdminLayout from './layouts/AdminLayout';       
// SucursalLayout va CON llaves porque es export function (a menos que lo hayas cambiado)
import { SucursalLayout } from './layouts/SucursalLayout'; 

function App() {
  return (
    <BrowserRouter>
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
           <Route path="sesiones" element={<h2>Sesiones</h2>} />
           <Route path="movimientos" element={<MovimientosPage />} />
           <Route path="ventas" element={<VentasPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;