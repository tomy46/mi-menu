import { 
  BuildingStorefrontIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  ClockIcon,
  EyeIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

export default function InfoTab({ 
  formData, 
  setFormData, 
  saving, 
  handleSave, 
  publicUrl, 
  legacyUrl, 
  copy 
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Restaurant Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <BuildingStorefrontIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Información del restaurante</h3>
            <p className="text-sm text-gray-600">Datos básicos de tu negocio</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nombre del restaurante</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre de tu restaurante"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              <PhoneIcon className="w-4 h-4 inline mr-1" />
              Teléfono
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+54 9 11 1234-5678"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              <MapPinIcon className="w-4 h-4 inline mr-1" />
              Dirección
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Av. Corrientes 1234, CABA"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              <GlobeAltIcon className="w-4 h-4 inline mr-1" />
              Sitio web
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://turestaurante.com"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Horarios
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              value={formData.hours}
              onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
              placeholder="Lun-Vie: 12:00-15:00, 19:00-23:00&#10;Sáb-Dom: 12:00-23:00"
              rows={3}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-gray-300 text-[#111827] focus:ring-[#111827]"
              />
              <span className="text-sm font-medium text-gray-700">Hacer el menú público</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Los clientes podrán ver tu menú en línea
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-[#111827] text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar información'}
        </button>
      </div>

      {/* Public Menu Links */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Enlaces públicos</h3>
            <p className="text-sm text-gray-600">Compartí tu menú con clientes</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Enlace principal</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
                value={publicUrl}
                readOnly
              />
              <button
                onClick={() => copy(publicUrl)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                Copiar
              </button>
            </div>
          </div>
          
          {legacyUrl && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Enlace alternativo</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
                  value={legacyUrl}
                  readOnly
                />
                <button
                  onClick={() => copy(legacyUrl)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <EyeIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Vista previa</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Mirá cómo se ve tu menú para los clientes
            </p>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              Ver menú público
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
