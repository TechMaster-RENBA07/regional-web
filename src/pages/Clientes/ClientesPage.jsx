import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react'; // <--- IMPORTACIÓN DE ÍCONOS

import { clientesService } from '../../services/clientesService';
import { sucursalesService } from '../../services/sucursalesService'; 
import { ClientesModal } from './ClientesModal';
import { ConfirmModal } from '../Sucursales/ConfirmModal';

export function ClientesPage() {
  const { id } = useParams(); // ID DE LA SUCURSAL ACTUAL
  
  const [clientes, setClientes] = useState([]);
  const [idRestauranteActual, setIdRestauranteActual] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    
    // 1. Buscamos todas las sucursales para saber a qué restaurante pertenece la actual
    const sucursales = await sucursalesService.listarTodos();
    const sucursalActual = sucursales.find(s => s.idSucursal == id);

    if (sucursalActual) {
        // Guardamos el ID del restaurante para usarlo al crear clientes
        const idRest = sucursalActual.idRestaurante;
        setIdRestauranteActual(idRest);

        // 2. Buscamos todos los clientes
        const todosClientes = await clientesService.listarTodos();

        // 3. Filtramos clientes que sean del mismo restaurante
        const clientesFiltrados = todosClientes.filter(c => c.idRestaurante == idRest);
        setClientes(clientesFiltrados);
    }

    setCargando(false);
  };

  // --- CRUD ---
  const abrirModalCrear = () => { setClienteEditar(null); setIsModalOpen(true); };
  const abrirModalEditar = (c) => { setClienteEditar(c); setIsModalOpen(true); };

  const guardarCliente = async (datos) => {
    const toastId = toast.loading('Guardando...');
    let resultado;

    // VALIDACIÓN IMPORTANTE
    if (!idRestauranteActual) {
        toast.error('Error: No se identificó el restaurante', { id: toastId });
        return;
    }

    if (datos.idCliente) {
        // En tu Postman, el PUT pide el ID en la URL y los datos en el body
        const { idCliente, ...restoDatos } = datos; // Separamos el ID
        resultado = await clientesService.actualizar(idCliente, restoDatos);
    } else {
        resultado = await clientesService.crear(datos);
    }

    if(resultado) {
        cargarDatos();
        setIsModalOpen(false);
        toast.success('¡Cliente registrado!', { id: toastId });
    } else {
        toast.error('Error al guardar', { id: toastId });
    }
  };

  const confirmarEliminacion = async () => {
    if (idToDelete) {
        const toastId = toast.loading('Eliminando...');
        const exito = await clientesService.eliminar(idToDelete);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-coffee-900">Cartera de Clientes</h2>
          <p className="text-coffee-800 opacity-70 mt-1">Directorio de personas y empresas</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition">
          + Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-coffee-800/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-coffee-900 text-cream-100">
                <tr>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Nombre / Razón Social</th>
                    <th className="p-4">Documento</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-coffee-800/10">
                {!cargando && clientes.map((cliente) => (
                    <tr key={cliente.idCliente} className="hover:bg-cream-200/50 transition">
                        
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                cliente.tipoCliente === 'Empresa' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {cliente.tipoCliente}
                            </span>
                        </td>

                        <td className="p-4 font-bold text-coffee-900">{cliente.nombreRazonSocial}</td>
                        <td className="p-4 font-mono text-sm">{cliente.documento}</td>
                        
                        <td className="p-4 text-sm text-gray-600">
                            <div className="flex flex-col">
                                <span>📞 {cliente.telefono || '-'}</span>
                                <span className="text-xs text-gray-400">{cliente.email}</span>
                            </div>
                        </td>

                        {/* --- AQUÍ ESTÁN LOS ICONOS NUEVOS --- */}
                        <td className="p-4 flex justify-center gap-1 items-center">
                            <button 
                                onClick={() => abrirModalEditar(cliente)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                title="Editar"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={() => { setIdToDelete(cliente.idCliente); setIsDeleteOpen(true); }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                title="Eliminar"
                            >
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
                {!cargando && clientes.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay clientes registrados en este restaurante.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      <ClientesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={guardarCliente}
        clienteEditar={clienteEditar}
        idRestauranteActual={idRestauranteActual} // Pasamos el ID del restaurante detectado
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmarEliminacion}
        mensaje="¿Eliminar este cliente de la base de datos?"
      />
    </div>
  );
}