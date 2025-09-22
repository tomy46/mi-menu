import React, { useEffect } from 'react'
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

/**
 * Reusable Dialog component for the platform
 * 
 * IMPORTANT: Always render this component at the root level of your component,
 * NOT inside map functions or item renderers to avoid backdrop issues.
 * 
 * ✅ Correct usage:
 * return (
 *   <div>
 *     {items.map(item => <ItemCard />)}
 *     <Dialog isOpen={showDialog} ... />
 *   </div>
 * )
 * 
 * ❌ Incorrect usage:
 * {items.map(item => (
 *   <div>
 *     <ItemCard />
 *     <Dialog isOpen={showDialog} ... />
 *   </div>
 * ))}
 * 
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {function} onClose - Callback when dialog should close
 * @param {string} title - Dialog title (required)
 * @param {string} description - Optional description text
 * @param {string} icon - Icon type: 'success', 'error', 'warning', 'info'
 * @param {object} primaryButton - Primary button config: { text, onClick, variant }
 * @param {object} secondaryButton - Secondary button config: { text, onClick, variant }
 * @param {string} size - Dialog size: 'sm', 'md', 'lg'
 */
export default function Dialog({
  isOpen = false,
  onClose,
  title,
  description,
  icon,
  primaryButton,
  secondaryButton,
  size = 'md'
}) {
  // No need for icon initialization with Heroicons
  useEffect(() => {}, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIconConfig = () => {
    switch (icon) {
      case 'success':
        return {
          component: CheckCircleIcon,
          color: 'text-green-500',
          bgColor: 'bg-green-100'
        }
      case 'error':
        return {
          component: XCircleIcon,
          color: 'text-red-500',
          bgColor: 'bg-red-100'
        }
      case 'warning':
        return {
          component: ExclamationTriangleIcon,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100'
        }
      case 'info':
        return {
          component: InformationCircleIcon,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100'
        }
      default:
        return null
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm'
      case 'lg':
        return 'max-w-2xl'
      default:
        return 'max-w-md'
    }
  }

  const getButtonVariantClasses = (variant = 'primary') => {
    switch (variant) {
      case 'primary':
        return 'bg-[#111827] hover:bg-gray-800 text-white'
      case 'secondary':
        return 'border border-[#111827] bg-white hover:bg-gray-50 text-[#111827]'
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      default:
        return 'border border-[#111827] bg-white hover:bg-gray-50 text-[#111827]'
    }
  }

  const iconConfig = getIconConfig()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative z-10 bg-white rounded-lg shadow-xl w-full ${getSizeClasses()} transform transition-all`}>
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start">
              {/* Icon */}
              {iconConfig && (
                <div className={`flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconConfig.bgColor} mb-4 sm:mx-0 sm:h-10 sm:w-10 sm:mb-0 sm:mr-4`}>
                  {React.createElement(iconConfig.component, {
                    className: `w-6 h-6 ${iconConfig.color}`
                  })}
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-500">
                    {description}
                  </p>
                )}
              </div>

              {/* Close button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          {(primaryButton || secondaryButton) && (
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              {secondaryButton && (
                <button
                  onClick={secondaryButton.onClick}
                  className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition-colors ${getButtonVariantClasses(secondaryButton.variant)}`}
                >
                  {secondaryButton.text}
                </button>
              )}
              {primaryButton && (
                <button
                  onClick={primaryButton.onClick}
                  className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition-colors ${getButtonVariantClasses(primaryButton.variant || 'primary')}`}
                >
                  {primaryButton.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
