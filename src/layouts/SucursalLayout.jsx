import { useEffect, useState } from 'react';
import { Outlet, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Armchair, UtensilsCrossed, Users, Wallet, History, TrendingUp, ShoppingCart } from 'lucide-react';

// Importamos el servicio para buscar el nombre
import { sucursalesService } from '../services/sucursalesService';

export function SucursalLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estado para guardar el nombre real
  const [nombreSucursal, setNombreSucursal] = useState(`SUCURSAL #${id}`);

  useEffect(() => {
    async function obtenerNombre() {
      try {
        // Pedimos la lista de sucursales
        const lista = await sucursalesService.listarTodos();
        
        // Buscamos la que coincide con el ID de la URL
        const encontrada = lista.find(s => String(s.idSucursal) === String(id));
        
        if (encontrada) {
          setNombreSucursal(encontrada.nombre.toUpperCase()); // Lo ponemos en mayúsculas
        }
      } catch (error) {
        console.error("No se pudo obtener el nombre de la sucursal");
      }
    }
    obtenerNombre();
  }, [id]);

  return (
    <div className="flex h-screen w-full font-sans">
      
      <aside className="w-64 bg-coffee-900 text-cream-100 flex flex-col shadow-xl">
        <div className="p-6 border-b border-coffee-800">
          {/* TÍTULO DINÁMICO */}
          <h1 className="text-lg font-bold tracking-wider text-center leading-tight">
            <span className="text-terracotta-500 block text-2xl mb-1">{nombreSucursal}</span>
            <span className="text-xs font-normal opacity-50">PANEL DE CONTROL</span>
          </h1>
          
          <button 
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 mt-4 hover:text-white underline w-full text-center block transition"
          >
            ← Volver al SuperAdmin
          </button>
        </div>

        <nav className="flex flex-col gap-2 px-4 mt-6 overflow-y-auto">
          <MenuLink to={`/sucursal/${id}/dashboard`} icon={<LayoutDashboard size={20} />} label="Resumen" />
          <MenuLink to={`/sucursal/${id}/mesas`}     icon={<Armchair size={20} />}        label="Mesas" />
          <MenuLink to={`/sucursal/${id}/pedidos`}   icon={<UtensilsCrossed size={20} />} label="Pedidos" />
          <MenuLink to={`/sucursal/${id}/clientes`}  icon={<Users size={20} />}           label="Clientes" />
          <MenuLink to={`/sucursal/${id}/caja`}      icon={<Wallet size={20} />}          label="Caja" />
          <MenuLink to={`/sucursal/${id}/sesiones`}  icon={<History size={20} />}         label="Sesiones" />
          <MenuLink to={`/sucursal/${id}/movimientos`} icon={<TrendingUp size={20} />}    label="Movimientos" />
          <MenuLink to={`/sucursal/${id}/ventas`}    icon={<ShoppingCart size={20} />}    label="Ventas" />
        </nav>
      </aside>

      <main className="flex-1 bg-cream-100 p-10 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
}

// Componente auxiliar de Link
function MenuLink({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  
  return (
    <Link to={to}>
      <div className={`p-3 rounded-lg cursor-pointer transition flex items-center gap-3 ${
        isActive 
          ? 'bg-terracotta-500 text-white shadow-md' 
          : 'text-cream-200 hover:bg-coffee-800 hover:text-white'
      }`}>
        {icon}
        <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
      </div>
    </Link>
  );
}