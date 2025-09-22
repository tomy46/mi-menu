import { useState, useCallback } from 'react'

/**
 * Custom hook for managing snackbar state
 * 
 * @returns {object} Object with snackbar state and control functions
 */
export function useSnackbar() {
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    duration: 5000,
    position: 'bottom',
    action: null
  })

  const showSnackbar = useCallback((config) => {
    setSnackbar({
      isOpen: true,
      message: config.message || '',
      type: config.type || 'info',
      duration: config.duration || 5000,
      position: config.position || 'bottom',
      action: config.action || null
    })
  }, [])

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  // Convenience methods for different types
  const showSuccess = useCallback((message, options = {}) => {
    showSnackbar({
      message,
      type: 'success',
      ...options
    })
  }, [showSnackbar])

  const showError = useCallback((message, options = {}) => {
    showSnackbar({
      message,
      type: 'error',
      ...options
    })
  }, [showSnackbar])

  const showWarning = useCallback((message, options = {}) => {
    showSnackbar({
      message,
      type: 'warning',
      ...options
    })
  }, [showSnackbar])

  const showInfo = useCallback((message, options = {}) => {
    showSnackbar({
      message,
      type: 'info',
      ...options
    })
  }, [showSnackbar])

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
