import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  QrCodeIcon,
  TableCellsIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'

export default function QROptionsDialog({ isOpen, onClose, onSelectOption }) {
  const [qrType, setQrType] = useState('single')
  const [tableCount, setTableCount] = useState(10)
  const [startNumber, setStartNumber] = useState(1)

  // Manejar tecla ESC para cerrar el diálogo
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleContinue = () => {
    if (qrType === 'single') {
      onSelectOption({
        type: 'single',
        tableCount: 1,
        startNumber: null
      })
    } else {
      onSelectOption({
        type: 'multiple',
        tableCount: parseInt(tableCount),
        startNumber: parseInt(startNumber)
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Generar Códigos QR</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tipo de QR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Qué tipo de códigos QR necesitas?
            </label>
            <div className="space-y-3">
              {/* QR Único */}
              <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="qrType"
                  value="single"
                  checked={qrType === 'single'}
                  onChange={(e) => setQrType(e.target.value)}
                  className="mt-1 text-[#111827] focus:ring-[#111827]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <DocumentIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">QR Único</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Un solo código QR para todo el restaurante
                  </p>
                </div>
              </label>

              {/* QR por Mesa */}
              <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="qrType"
                  value="multiple"
                  checked={qrType === 'multiple'}
                  onChange={(e) => setQrType(e.target.value)}
                  className="mt-1 text-[#111827] focus:ring-[#111827]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TableCellsIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">QR por Mesa</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Un código QR único para cada mesa (ideal para métricas)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Configuración para múltiples mesas */}
          {qrType === 'multiple' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cuántas mesas necesitas?
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tableCount}
                  onChange={(e) => setTableCount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Desde qué número empezar a contar?
                </label>
                <input
                  type="number"
                  min="1"
                  value={startNumber}
                  onChange={(e) => setStartNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: Si empiezas en 1 y necesitas 10 mesas, generarás QR para mesas 1-10
                </p>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
