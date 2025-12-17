import { Outlet, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex h-screen w-full font-sans">
      {/* SIDEBAR DEL SUPER ADMIN */}
      <aside className="w-64 bg-coffee-900 text-cream-100 flex flex-col shadow-xl">
        <div className="p-6 border-b border-coffee-800">
           <h1 className="text-2xl font-bold tracking-wider text-center">
            SUPER<span className="text-terracotta-500">ADMIN</span>
          </h1>
          <p className="text-xs text-center text-gray-400 mt-2">Panel Global</p>
        </div>

        <nav className="flex flex-col gap-2 px-4 mt-6">
           {/* Enlace único a Sucursales */}
           <Link to="/" className="p-3 bg-terracotta-500 text-white rounded-lg flex gap-3 shadow-md hover:bg-terracotta-600 transition">
             <span>🏢</span> <span className="font-semibold">Sucursales</span>
           </Link>
           
           {/* Puedes agregar más opciones globales aquí si necesitas */}
        </nav>
      </aside>

      {/* AQUÍ SE CARGA LA LISTA DE SUCURSALES (SucursalesPage) */}
      <main className="flex-1 bg-cream-100 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}