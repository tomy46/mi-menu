import Dialog from './Dialog.jsx'

/**
 * Confirmation Dialog component
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {function} onClose - Callback when dialog should close
 * @param {function} onConfirm - Callback when user confirms
 * @param {string} title - Dialog title
 * @param {string} description - Description text
 * @param {string} confirmText - Text for confirm button (default: "Confirmar")
 * @param {string} cancelText - Text for cancel button (default: "Cancelar")
 * @param {string} variant - Confirm button variant: 'danger', 'primary', 'success' (default: 'danger')
 */
export default function ConfirmDialog({
  isOpen = false,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger"
}) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    if (onClose) {
      onClose()
    }
  }

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return 'warning'
      case 'success':
        return 'success'
      default:
        return 'info'
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      icon={getIcon()}
      primaryButton={{
        text: confirmText,
        onClick: handleConfirm,
        variant: variant
      }}
      secondaryButton={{
        text: cancelText,
        onClick: onClose,
        variant: 'secondary'
      }}
      size="sm"
    />
  )
}
