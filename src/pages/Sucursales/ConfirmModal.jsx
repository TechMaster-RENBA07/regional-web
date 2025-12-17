export function ConfirmModal({ isOpen, onClose, onConfirm, mensaje }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm border border-coffee-800/20 text-center animate-fadeIn">
        
        {/* Ícono de Advertencia (Un triangulito SVG simple) */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-lg leading-6 font-bold text-coffee-900 mb-2">
          ¿Estás seguro?
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          {mensaje || "Esta acción no se puede deshacer. ¿Deseas eliminar este registro permanentemente?"}
        </p>

        {/* Botones */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md transition"
          >
            Sí, Eliminar
          </button>
        </div>

      </div>
    </div>
  );
}