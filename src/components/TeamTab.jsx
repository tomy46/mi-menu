import { useState } from 'react'
import { 
  UsersIcon, 
  PlusIcon, 
  TrashIcon,
  UserCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

export default function TeamTab({ restaurant, restaurantId }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    
    setInviting(true)
    try {
      // TODO: Implement team member invitation
      setInviteEmail('')
      // showSuccess('Invitación enviada exitosamente')
    } catch (error) {
      // showError('Error al enviar la invitación')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    try {
      // TODO: Implement team member removal
      // showSuccess('Miembro removido del equipo')
    } catch (error) {
      // showError('Error al remover miembro del equipo')
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Equipo del restaurante</h3>
            <p className="text-sm text-gray-600">Gestiona quién puede editar tu menú</p>
          </div>
        </div>

        {/* Current Team Members */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Miembros actuales ({restaurant?.owners?.length || 1})
          </h4>
          <div className="space-y-3">
            {restaurant?.owners?.map((ownerId, index) => (
              <div key={ownerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {index === 0 ? 'Propietario' : 'Miembro del equipo'}
                    </p>
                    <p className="text-xs text-gray-500">{ownerId}</p>
                  </div>
                </div>
                {index > 0 && (
                  <button
                    onClick={() => handleRemoveMember(ownerId)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remover del equipo"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invite New Member */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Invitar nuevo miembro</h4>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="px-4 py-2 bg-[#111827] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              {inviting ? 'Enviando...' : 'Invitar'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Se enviará una invitación por email para unirse al equipo
          </p>
        </div>


        {/* Coming Soon Notice */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-600 text-sm font-medium">🚧 Próximamente</span>
          </div>
          <p className="text-xs text-amber-800">
            La funcionalidad de equipo estará disponible en el plan Pro y Enterprise. 
            Podrás invitar colaboradores para que te ayuden a gestionar tu menú.
          </p>
        </div>
      </div>
    </div>
  )
}
