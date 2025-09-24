import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  QrCodeIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const QR_COLORS = [
  { id: 'black', name: 'Negro', color: '#000000', bg: '#FFFFFF' },
  { id: 'gray', name: 'Gris', color: '#6B7280', bg: '#FFFFFF' },
  { id: 'green', name: 'Verde', color: '#059669', bg: '#FFFFFF' },
  { id: 'red', name: 'Rojo', color: '#DC2626', bg: '#FFFFFF' },
  { id: 'orange', name: 'Naranja', color: '#EA580C', bg: '#FFFFFF' },
  { id: 'blue', name: 'Azul', color: '#1F2937', bg: '#FFFFFF' },
  { id: 'purple', name: 'Morado', color: '#7C3AED', bg: '#FFFFFF' },
  { id: 'yellow', name: 'Amarillo', color: '#FCD34D', bg: '#FFFFFF' }
]

const BACKGROUND_COLORS = [
  { id: 'black', name: 'Negro', color: '#000000', textColor: '#FFFFFF' },
  { id: 'gray', name: 'Gris', color: '#6B7280', textColor: '#FFFFFF' },
  { id: 'green', name: 'Verde', color: '#059669', textColor: '#FFFFFF' },
  { id: 'red', name: 'Rojo', color: '#DC2626', textColor: '#FFFFFF' },
  { id: 'orange', name: 'Naranja', color: '#EA580C', textColor: '#FFFFFF' },
  { id: 'blue', name: 'Azul', color: '#1F2937', textColor: '#FFFFFF' },
  { id: 'purple', name: 'Morado', color: '#7C3AED', textColor: '#FFFFFF' },
  { id: 'yellow', name: 'Amarillo', color: '#FCD34D', textColor: '#1F2937' }
]

export default function QRGeneratorNew({ 
  isOpen, 
  onClose, 
  onBack,
  restaurantId, 
  restaurantName, 
  restaurantLogo,
  options 
}) {
  const [qrColor, setQrColor] = useState('black')
  const [backgroundColor, setBackgroundColor] = useState('yellow')
  const [currentTable, setCurrentTable] = useState(0)
  const [qrDataUrls, setQrDataUrls] = useState([])
  const [generating, setGenerating] = useState(false)
  const qrContainerRef = useRef(null)

  const selectedQrColor = QR_COLORS.find(c => c.id === qrColor)
  const selectedBgColor = BACKGROUND_COLORS.find(c => c.id === backgroundColor)

  // Generar URLs para cada mesa
  const generateUrls = () => {
    const urls = []
    if (options.type === 'single') {
      urls.push(`${window.location.origin}/r/${restaurantId}`)
    } else {
      for (let i = 0; i < options.tableCount; i++) {
        const tableNumber = options.startNumber + i
        urls.push(`${window.location.origin}/r/${restaurantId}?mesa=${tableNumber}`)
      }
    }
    return urls
  }

  // Función para generar URL con idioma específico (preparado para futuro)
  const generateUrlWithLanguage = (baseUrl, language = null) => {
    if (!language) return baseUrl
    
    const url = new URL(baseUrl)
    url.searchParams.set('lang', language)
    return url.toString()
  }

  const urls = generateUrls()

  useEffect(() => {
    if (isOpen) {
      generateAllQRs()
    }
  }, [isOpen, qrColor])

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

  const generateAllQRs = async () => {
    try {
      const qrOptions = {
        width: 400,
        margin: 1,
        color: {
          dark: selectedQrColor.color,
          light: selectedQrColor.bg
        },
        type: 'image/png',
        errorCorrectionLevel: 'M',
        quality: 1
      }

      const dataUrls = await Promise.all(
        urls.map(url => QRCode.toDataURL(url, qrOptions))
      )
      setQrDataUrls(dataUrls)
    } catch (error) {
      console.error('Error generating QRs:', error)
    }
  }

  const createTableQRImage = async (tableIndex, highRes = false) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Configurar tamaño del canvas
      const scale = highRes ? 3 : 1
      const canvasWidth = 300 * scale
      const canvasHeight = 400 * scale
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Fondo de color
      ctx.fillStyle = selectedBgColor.color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Bordes redondeados del contenedor blanco
      const containerPadding = 20 * scale
      const containerX = containerPadding
      const containerY = containerPadding
      const containerWidth = canvas.width - (containerPadding * 2)
      const containerHeight = canvas.height - (containerPadding * 2)
      const borderRadius = 16 * scale
      
      // Dibujar contenedor blanco con bordes redondeados
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(containerX, containerY, containerWidth, containerHeight, borderRadius)
      ctx.fill()
      
      // Título "Scan to place your order"
      ctx.fillStyle = '#1F2937'
      ctx.font = `bold ${18 * scale}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText('Escanea el código QR', canvas.width / 2, containerY + 40 * scale)
      ctx.fillText('para ver el menú', canvas.width / 2, containerY + 65 * scale)
      
      // Número de mesa (solo si es múltiple)
      if (options.type === 'multiple') {
        const tableNumber = options.startNumber + tableIndex
        ctx.fillStyle = selectedBgColor.color
        ctx.font = `bold ${14 * scale}px Arial`
        ctx.fillText(`Mesa ${tableNumber}`, canvas.width / 2, containerY + 95 * scale)
      }
      
      // Cargar y dibujar QR
      const qrImg = new Image()
      qrImg.onload = () => {
        const qrSize = 180 * scale
        const qrX = (canvas.width - qrSize) / 2
        const qrY = containerY + 110 * scale
        
        // Fondo blanco para el QR
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(qrX - 10 * scale, qrY - 10 * scale, qrSize + 20 * scale, qrSize + 20 * scale)
        
        // Borde decorativo amarillo alrededor del QR
        ctx.strokeStyle = selectedBgColor.color
        ctx.lineWidth = 4 * scale
        ctx.strokeRect(qrX - 10 * scale, qrY - 10 * scale, qrSize + 20 * scale, qrSize + 20 * scale)
        
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
        
        // Logo del restaurante en el centro del QR (si existe)
        if (restaurantLogo) {
          const logoImg = new Image()
          logoImg.crossOrigin = 'anonymous'
          logoImg.onload = () => {
            const logoSize = 40 * scale
            const logoX = (canvas.width - logoSize) / 2
            const logoY = qrY + (qrSize - logoSize) / 2
            
            // Fondo blanco para el logo
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.roundRect(logoX - 5 * scale, logoY - 5 * scale, logoSize + 10 * scale, logoSize + 10 * scale, 8 * scale)
            ctx.fill()
            
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
            const result = canvas.toDataURL('image/png')
            resolve(result)
          }
          logoImg.onerror = () => {
            const result = canvas.toDataURL('image/png')
            resolve(result)
          }
          logoImg.src = restaurantLogo
        } else {
          const result = canvas.toDataURL('image/png')
          resolve(result)
        }
      }
      qrImg.onerror = (error) => {
        console.error('Failed to load QR image:', error)
        reject(new Error('Failed to load QR code'))
      }
      qrImg.src = qrDataUrls[tableIndex]
    })
  }

  const downloadSingle = async (format, tableIndex) => {
    if (!qrDataUrls[tableIndex]) return
    
    setGenerating(true)
    try {
      const compositeImageData = await createTableQRImage(tableIndex, format === 'pdf')
      
      if (format === 'jpg') {
        const link = document.createElement('a')
        const tableNumber = options.type === 'multiple' ? `-mesa-${options.startNumber + tableIndex}` : ''
        link.download = `qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}${tableNumber}.jpg`
        link.href = compositeImageData.replace('image/png', 'image/jpeg')
        link.click()
      } else if (format === 'pdf') {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })
        
        const imgWidth = 120
        const imgHeight = 160
        const x = (210 - imgWidth) / 2
        const y = (297 - imgHeight) / 2
        
        pdf.addImage(compositeImageData, 'PNG', x, y, imgWidth, imgHeight)
        
        const tableNumber = options.type === 'multiple' ? `-mesa-${options.startNumber + tableIndex}` : ''
        pdf.save(`qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}${tableNumber}.pdf`)
      }
    } catch (error) {
      console.error('Error creating image:', error)
      alert('Error al generar la descarga. Por favor, intenta nuevamente.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadAll = async (format) => {
    if (options.type === 'single') {
      downloadSingle(format, 0)
      return
    }

    setGenerating(true)
    try {
      if (format === 'pdf') {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })

        for (let i = 0; i < qrDataUrls.length; i++) {
          if (i > 0) pdf.addPage()
          
          const compositeImageData = await createTableQRImage(i, true)
          const imgWidth = 120
          const imgHeight = 160
          const x = (210 - imgWidth) / 2
          const y = (297 - imgHeight) / 2
          
          pdf.addImage(compositeImageData, 'PNG', x, y, imgWidth, imgHeight)
        }
        
        pdf.save(`qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}-todas-las-mesas.pdf`)
      } else {
        // Para JPG, descargar individualmente
        for (let i = 0; i < qrDataUrls.length; i++) {
          await downloadSingle('jpg', i)
          // Pequeña pausa entre descargas
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    } catch (error) {
      console.error('Error downloading all:', error)
      alert('Error al generar las descargas. Por favor, intenta nuevamente.')
    } finally {
      setGenerating(false)
    }
  }

  if (!isOpen) return null

  const currentTableNumber = options.type === 'multiple' ? options.startNumber + currentTable : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
            </button>
            <QrCodeIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {options.type === 'single' ? 'Código QR Único' : `Códigos QR por Mesa (${options.tableCount} mesas)`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuración */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración</h3>
                
                {/* Color del QR */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color del QR
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {QR_COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setQrColor(color.id)}
                        className={`p-3 border rounded-lg text-center transition-all ${
                          qrColor === color.id
                            ? 'border-[#111827] bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded mx-auto mb-1"
                          style={{ backgroundColor: color.color }}
                        ></div>
                        <div className="text-xs text-gray-700">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color de fondo */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color de fondo
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {BACKGROUND_COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setBackgroundColor(color.id)}
                        className={`p-3 border rounded-lg text-center transition-all ${
                          backgroundColor === color.id
                            ? 'border-[#111827] bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded mx-auto mb-1"
                          style={{ backgroundColor: color.color }}
                        ></div>
                        <div className="text-xs text-gray-700">{color.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navegación entre mesas (solo para múltiples) */}
                {options.type === 'multiple' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Vista previa de mesa
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <button
                        onClick={() => setCurrentTable(Math.max(0, currentTable - 1))}
                        disabled={currentTable === 0}
                        className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <span className="font-medium">
                        Mesa {currentTableNumber} ({currentTable + 1} de {options.tableCount})
                      </span>
                      <button
                        onClick={() => setCurrentTable(Math.min(options.tableCount - 1, currentTable + 1))}
                        disabled={currentTable === options.tableCount - 1}
                        className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de descarga */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Descargar</h4>
                <div className="space-y-3">
                  {/* Descarga individual */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadSingle('jpg', currentTable)}
                      disabled={generating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      {generating ? 'Generando...' : 'JPG'}
                    </button>
                    <button
                      onClick={() => downloadSingle('pdf', currentTable)}
                      disabled={generating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#111827] text-[#111827] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      {generating ? 'Generando...' : 'PDF'}
                    </button>
                  </div>

                  {/* Descarga todas (solo para múltiples) */}
                  {options.type === 'multiple' && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600 mb-2">Descargar todas las mesas:</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => downloadAll('jpg')}
                          disabled={generating}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PhotoIcon className="w-4 h-4" />
                          {generating ? 'Generando...' : 'Todas JPG'}
                        </button>
                        <button
                          onClick={() => downloadAll('pdf')}
                          disabled={generating}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          {generating ? 'Generando...' : 'Todas PDF'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vista previa */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vista Previa</h3>
              
              <div 
                ref={qrContainerRef}
                className="relative"
                style={{ 
                  backgroundColor: selectedBgColor.color,
                  padding: '20px',
                  borderRadius: '16px',
                  width: '300px',
                  height: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {/* Contenedor blanco */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  {/* Título */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1F2937',
                      marginBottom: '8px'
                    }}>
                      Escanea el código QR<br />para ver el menú
                    </div>
                    {options.type === 'multiple' && (
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: selectedBgColor.color,
                        marginTop: '8px'
                      }}>
                        Mesa {currentTableNumber}
                      </div>
                    )}
                  </div>

                  {/* QR Code */}
                  <div style={{
                    border: `4px solid ${selectedBgColor.color}`,
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: '#FFFFFF',
                    position: 'relative'
                  }}>
                    {qrDataUrls[currentTable] && (
                      <img 
                        src={qrDataUrls[currentTable]} 
                        alt="Código QR"
                        style={{ 
                          width: '180px', 
                          height: '180px',
                          display: 'block'
                        }}
                      />
                    )}
                    
                    {/* Logo en el centro */}
                    {restaurantLogo && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        padding: '5px'
                      }}>
                        <img 
                          src={restaurantLogo} 
                          alt={restaurantName}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '4px',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ height: '20px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
