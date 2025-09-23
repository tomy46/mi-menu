import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  QrCodeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'


const QR_COLORS = [
  { id: 'black', name: 'Negro', color: '#000000', bg: '#FFFFFF' },
  { id: 'blue', name: 'Azul', color: '#1F2937', bg: '#FFFFFF' },
  { id: 'green', name: 'Verde', color: '#059669', bg: '#FFFFFF' },
  { id: 'red', name: 'Rojo', color: '#DC2626', bg: '#FFFFFF' },
  { id: 'purple', name: 'Morado', color: '#7C3AED', bg: '#FFFFFF' }
]

export default function QRGenerator({ isOpen, onClose, restaurantId, restaurantName, restaurantLogo }) {
  const [qrColor, setQrColor] = useState('black')
  const [showWrapper, setShowWrapper] = useState(true)
  const [showLogo, setShowLogo] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const qrContainerRef = useRef(null)

  const qrUrl = `${window.location.origin}/r/${restaurantId}`
  const selectedColor = QR_COLORS.find(c => c.id === qrColor)

  useEffect(() => {
    if (isOpen) {
      generateQR()
    }
  }, [isOpen, qrColor])

  const generateQR = async () => {
    try {
      const options = {
        width: 600, // Mayor resolución para mejor calidad de impresión
        margin: 1,
        color: {
          dark: selectedColor.color,
          light: selectedColor.bg
        },
        type: 'image/png',
        errorCorrectionLevel: 'M', // Nivel medio de corrección de errores
        quality: 1 // Máxima calidad
      }

      const dataUrl = await QRCode.toDataURL(qrUrl, options)
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR:', error)
    }
  }

  const createCompositeImage = async (highRes = false) => {
    return new Promise((resolve, reject) => {
      console.log('Creating composite image with wrapper:', showWrapper, 'highRes:', highRes)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Configurar tamaño del canvas (más grande para alta resolución)
      const baseSize = showWrapper ? 400 : 300
      const scale = highRes ? 3 : 1 // 3x para PDF de alta calidad
      const canvasSize = baseSize * scale
      canvas.width = canvasSize
      canvas.height = canvasSize
      console.log('Canvas size:', canvasSize, 'scale:', scale)
      
      // Configurar contexto para alta calidad
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      if (showWrapper) {
        // Dibujar borde (escalado)
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 2 * scale
        ctx.strokeRect(10 * scale, 10 * scale, canvas.width - 20 * scale, canvas.height - 20 * scale)
        
        // Texto superior (escalado)
        ctx.fillStyle = '#6b7280'
        ctx.font = `${14 * scale}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText('Escanea para ver nuestro menú', canvas.width / 2, 40 * scale)
      }
      
      // Cargar y dibujar QR
      const qrImg = new Image()
      qrImg.onload = () => {
        console.log('QR image loaded successfully')
        const qrSize = 200 * scale
        const qrX = (canvas.width - qrSize) / 2
        const qrY = showWrapper ? 70 * scale : 50 * scale
        
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
        console.log('QR drawn at position:', qrX, qrY, 'size:', qrSize)
        
        if (showWrapper) {
          // Dibujar logo o nombre del restaurante
          if (showLogo && restaurantLogo) {
            console.log('Loading restaurant logo...')
            const logoImg = new Image()
            logoImg.crossOrigin = 'anonymous'
            logoImg.onload = () => {
              console.log('Logo loaded successfully')
              const logoSize = 48 * scale
              const logoX = (canvas.width - logoSize) / 2
              const logoY = qrY + qrSize + 20 * scale
              
              ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
              const result = canvas.toDataURL('image/png')
              console.log('Final image created with logo, length:', result.length)
              resolve(result)
            }
            logoImg.onerror = (error) => {
              console.log('Logo failed to load, using restaurant name instead:', error)
              // Si falla el logo, dibujar nombre
              ctx.fillStyle = '#111827'
              ctx.font = `bold ${16 * scale}px Arial`
              ctx.textAlign = 'center'
              ctx.fillText(restaurantName, canvas.width / 2, qrY + qrSize + 40 * scale)
              const result = canvas.toDataURL('image/png')
              console.log('Final image created with name, length:', result.length)
              resolve(result)
            }
            logoImg.src = restaurantLogo
          } else {
            console.log('Drawing restaurant name...')
            // Dibujar nombre del restaurante
            ctx.fillStyle = '#111827'
            ctx.font = `bold ${16 * scale}px Arial`
            ctx.textAlign = 'center'
            ctx.fillText(restaurantName, canvas.width / 2, qrY + qrSize + 40 * scale)
            const result = canvas.toDataURL('image/png')
            console.log('Final image created with name only, length:', result.length)
            resolve(result)
          }
        } else {
          console.log('No wrapper, returning QR only')
          const result = canvas.toDataURL('image/png')
          console.log('Final image created QR only, length:', result.length)
          resolve(result)
        }
      }
      qrImg.onerror = (error) => {
        console.error('Failed to load QR image:', error)
        reject(new Error('Failed to load QR code'))
      }
      qrImg.src = qrDataUrl
    })
  }

  const downloadImage = async (format) => {
    if (!qrDataUrl) {
      console.error('No QR data available')
      return
    }
    
    console.log('Starting download for format:', format)
    setGenerating(true)
    try {
      console.log('Creating composite image...')
      const compositeImageData = await createCompositeImage()
      console.log('Composite image created, length:', compositeImageData.length)
      
      if (format === 'jpg') {
        // Convertir a JPG
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          
          // Fondo blanco para JPG
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          
          const link = document.createElement('a')
          link.download = `qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.jpg`
          link.href = canvas.toDataURL('image/jpeg', 0.9)
          link.click()
        }
        img.src = compositeImageData
        
      } else if (format === 'pdf') {
        // Crear imagen de alta resolución para PDF
        const highResImageData = await createCompositeImage(true)
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: false // Sin compresión para mejor calidad
        })
        
        // Configurar calidad de imagen
        pdf.setProperties({
          title: `Código QR - ${restaurantName}`,
          subject: 'Código QR para menú digital',
          author: restaurantName,
          creator: 'Menu App'
        })
        
        // Calcular dimensiones para centrar en A4 (tamaño más grande para mejor calidad)
        const imgWidth = 150 // Más grande para mejor legibilidad
        const imgHeight = 150
        const x = (210 - imgWidth) / 2
        const y = (297 - imgHeight) / 2
        
        // Agregar imagen con máxima calidad
        pdf.addImage(highResImageData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST')
        pdf.save(`qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
      }
    } catch (error) {
      console.error('Error creating composite image:', error)
      
      // Fallback simple: solo el QR
      try {
        if (format === 'jpg') {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const img = new Image()
          
          img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            
            const link = document.createElement('a')
            link.download = `qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.jpg`
            link.href = canvas.toDataURL('image/jpeg', 0.9)
            link.click()
          }
          img.src = qrDataUrl
          
        } else if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          })
          
          pdf.setFontSize(16)
          pdf.text(restaurantName, 105, 30, { align: 'center' })
          
          const imgWidth = 80
          const imgHeight = 80
          const x = (210 - imgWidth) / 2
          const y = 60
          
          pdf.addImage(qrDataUrl, 'PNG', x, y, imgWidth, imgHeight)
          
          pdf.setFontSize(12)
          pdf.text('Escanea para ver nuestro menú', 105, 160, { align: 'center' })
          
          pdf.save(`qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
        }
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError)
        alert('Error al generar la descarga. Por favor, intenta nuevamente.')
      }
    } finally {
      setGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Generar Código QR</h2>
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
                  <div className="grid grid-cols-5 gap-3">
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

                {/* Opciones de diseño */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Mostrar marco decorativo
                    </label>
                    <button
                      onClick={() => setShowWrapper(!showWrapper)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 ${
                        showWrapper ? 'bg-[#111827]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showWrapper ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {restaurantLogo && (
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Incluir logo del restaurante
                      </label>
                      <button
                        onClick={() => setShowLogo(!showLogo)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 ${
                          showLogo ? 'bg-[#111827]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showLogo ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de descarga */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Descargar</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadImage('jpg')}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PhotoIcon className="w-4 h-4" />
                    {generating ? 'Generando...' : 'JPG'}
                  </button>
                  <button
                    onClick={() => downloadImage('pdf')}
                    disabled={generating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#111827] text-[#111827] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    {generating ? 'Generando...' : 'PDF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Vista previa */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vista Previa</h3>
              
              <div 
                ref={qrContainerRef}
                style={{ 
                  backgroundColor: '#ffffff',
                  padding: '32px',
                  minWidth: '300px', 
                  minHeight: '300px',
                  border: showWrapper ? '2px solid #e5e7eb' : 'none',
                  borderRadius: showWrapper ? '8px' : '0',
                  boxShadow: showWrapper ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                {showWrapper && (
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0'
                    }}>
                      Escanea para ver nuestro menú
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {qrDataUrl && (
                    <img 
                      src={qrDataUrl} 
                      alt="Código QR"
                      style={{ 
                        width: '200px', 
                        height: '200px'
                      }}
                    />
                  )}
                </div>

                {showWrapper && (
                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    {showLogo && restaurantLogo ? (
                      <img 
                        src={restaurantLogo} 
                        alt={restaurantName}
                        style={{
                          width: '48px',
                          height: '48px',
                          margin: '0 auto',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#111827',
                        margin: '0'
                      }}>
                        {restaurantName}
                      </h3>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
