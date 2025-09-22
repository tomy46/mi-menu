import React, { useEffect, useState } from 'react'
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

/**
 * Snackbar component for showing temporary notifications
 * 
 * @param {boolean} isOpen - Controls snackbar visibility
 * @param {function} onClose - Callback when snackbar should close
 * @param {string} message - Message to display (required)
 * @param {string} type - Snackbar type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 5000)
 * @param {string} position - Position: 'top', 'bottom' (default: 'bottom')
 * @param {object} action - Action button config: { text, onClick }
 */
export default function Snackbar({
  isOpen = false,
  onClose,
  message,
  type = 'info',
  duration = 5000,
  position = 'bottom',
  action
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // No need for icon initialization with Heroicons
  useEffect(() => {}, [isVisible])

  // Handle auto-hide timer
  useEffect(() => {
    let timer
    
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      
      // Auto-hide after duration
      timer = setTimeout(() => {
        handleClose()
      }, duration)
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 300)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isOpen, duration])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, 300)
  }

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          component: CheckCircleIcon,
          bgColor: 'bg-green-600',
          textColor: 'text-white',
          iconColor: 'text-white'
        }
      case 'error':
        return {
          component: XCircleIcon,
          bgColor: 'bg-red-600',
          textColor: 'text-white',
          iconColor: 'text-white'
        }
      case 'warning':
        return {
          component: ExclamationTriangleIcon,
          bgColor: 'bg-yellow-600',
          textColor: 'text-white',
          iconColor: 'text-white'
        }
      case 'info':
      default:
        return {
          component: InformationCircleIcon,
          bgColor: 'bg-blue-600',
          textColor: 'text-white',
          iconColor: 'text-white'
        }
    }
  }

  const getPositionClasses = () => {
    return position === 'top' 
      ? 'top-4' 
      : 'bottom-4'
  }

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-in-out'
    if (position === 'top') {
      return `${baseClasses} ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`
    } else {
      return `${baseClasses} ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`
    }
  }

  if (!isVisible) return null

  const typeConfig = getTypeConfig()

  return (
    <div className={`fixed left-4 right-4 z-50 ${getPositionClasses()}`}>
      <div className={`mx-auto max-w-sm ${getAnimationClasses()}`}>
        <div className={`${typeConfig.bgColor} ${typeConfig.textColor} rounded-lg shadow-lg p-4 flex items-center gap-3`}>
          {/* Icon */}
          <div className="flex-shrink-0">
            {React.createElement(typeConfig.component, {
              className: `w-5 h-5 ${typeConfig.iconColor}`
            })}
          </div>
          
          {/* Message */}
          <div className="flex-1 text-sm font-medium">
            {message}
          </div>
          
          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className="flex-shrink-0 text-sm font-medium underline hover:no-underline transition-all"
            >
              {action.text}
            </button>
          )}
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${typeConfig.iconColor} hover:opacity-70 transition-opacity`}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
