import Dialog from './Dialog.jsx'

/**
 * Alert Dialog component for notifications
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {function} onClose - Callback when dialog should close
 * @param {string} title - Dialog title
 * @param {string} description - Description text
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info' (default: 'info')
 * @param {string} buttonText - Text for the button (default: "Entendido")
 */
export default function AlertDialog({
  isOpen = false,
  onClose,
  title,
  description,
  type = "info",
  buttonText = "Entendido"
}) {
  const getDefaultTitle = () => {
    switch (type) {
      case 'success':
        return "¡Éxito!"
      case 'error':
        return "Error"
      case 'warning':
        return "Advertencia"
      default:
        return "Información"
    }
  }

  const getButtonVariant = () => {
    switch (type) {
      case 'success':
        return 'success'
      case 'error':
        return 'danger'
      case 'warning':
        return 'primary'
      default:
        return 'primary'
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title || getDefaultTitle()}
      description={description}
      icon={type}
      primaryButton={{
        text: buttonText,
        onClick: onClose,
        variant: getButtonVariant()
      }}
      size="sm"
    />
  )
}
