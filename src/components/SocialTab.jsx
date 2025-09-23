import { ShareIcon } from '@heroicons/react/24/outline'

export default function SocialTab({ 
  socialMedia, 
  setSocialMedia, 
  saving, 
  handleSave 
}) {
  const handleSocialMediaChange = (platform, value) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: value
    }))
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShareIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Redes sociales</h3>
            <p className="text-sm text-gray-600">Enlaces a tus redes sociales</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Instagram */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  IG
                </span>
                Instagram
              </span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              value={socialMedia.instagram}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              placeholder="@turestaurante"
            />
            <p className="text-xs text-gray-500 mt-1">
              Podés usar @usuario o la URL completa
            </p>
          </div>

          {/* Facebook */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  FB
                </span>
                Facebook
              </span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              value={socialMedia.facebook}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              placeholder="facebook.com/turestaurante"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nombre de usuario o URL completa
            </p>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  WA
                </span>
                WhatsApp
              </span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
              value={socialMedia.whatsapp}
              onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
              placeholder="+54 9 11 1234-5678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Número de teléfono con código de país
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-[#111827] text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar redes sociales'}
        </button>

      </div>
    </div>
  )
}
