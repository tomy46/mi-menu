import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext.jsx'
import { createRestaurantFromWizard } from '../services/firestore.js'
import { useSnackbar } from '../hooks/useSnackbar.js'
import Snackbar from '../components/Snackbar.jsx'

const CATEGORY_OPTIONS = [
  'Café',
  'Bebidas', 
  'Plato principal',
  'Postres',
  'Aperitivos',
  'Pizzería',
  'Parrilla',
  'Comida rápida',
  'Otro'
]

const WelcomeWizard = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { snackbar, showError, showSuccess, hideSnackbar } = useSnackbar()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    restaurantName: '',
    category: '',
    customCategory: '',
    productName: '',
    productPrice: '',
    email: '',
    password: ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (!canProceed()) {
      switch (currentStep) {
        case 1:
          showError('Por favor ingresa el nombre de tu restaurante')
          break
        case 2:
          if (formData.category === '') {
            showError('Por favor selecciona una categoría')
          } else if (formData.category === 'Otro' && formData.customCategory.trim() === '') {
            showError('Por favor escribe tu categoría personalizada')
          }
          break
        case 3:
          if (formData.productName.trim() === '') {
            showError('Por favor ingresa el nombre del producto')
          } else if (formData.productPrice.trim() === '') {
            showError('Por favor ingresa el precio del producto')
          }
          break
        case 4:
          if (formData.email.trim() === '') {
            showError('Por favor ingresa tu email')
          } else if (formData.password.trim() === '') {
            showError('Por favor ingresa una contraseña')
          }
          break
      }
      return
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCategorySelect = (category) => {
    handleInputChange('category', category)
    if (category !== 'Otro') {
      handleInputChange('customCategory', '')
    }
  }

  const handleCreateAccount = async () => {
    if (!canProceed()) {
      if (formData.email.trim() === '') {
        showError('Por favor ingresa tu email')
      } else if (formData.password.trim() === '') {
        showError('Por favor ingresa una contraseña')
      }
      return
    }

    setIsLoading(true)
    try {
      // Register user
      const userCredential = await register(formData.email, formData.password)
      const uid = userCredential.user.uid
      
      // Create restaurant with wizard data
      const { restaurantId } = await createRestaurantFromWizard({
        uid,
        storeName: formData.restaurantName,
        category: formData.category === 'Otro' ? formData.customCategory : formData.category,
        productName: formData.productName,
        productPrice: formData.productPrice
      })
      
      // Show success message and navigate
      showSuccess('¡Cuenta creada exitosamente! Bienvenido a Mi Menú')
      setTimeout(() => {
        navigate(`/admin/${restaurantId}`)
      }, 1500)
    } catch (error) {
      console.error('Error creating account:', error)
      
      // Show specific error messages
      if (error.code === 'auth/email-already-in-use') {
        showError('Este email ya está registrado. Intenta con otro email.')
      } else if (error.code === 'auth/weak-password') {
        showError('La contraseña debe tener al menos 6 caracteres.')
      } else if (error.code === 'auth/invalid-email') {
        showError('El formato del email no es válido.')
      } else {
        showError('Error al crear la cuenta. Por favor intenta nuevamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.restaurantName.trim() !== ''
      case 2:
        return formData.category !== '' && (formData.category !== 'Otro' || formData.customCategory.trim() !== '')
      case 3:
        return formData.productName.trim() !== '' && formData.productPrice.trim() !== ''
      case 4:
        return formData.email.trim() !== '' && formData.password.trim() !== ''
      default:
        return false
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return '¿Cómo se llama tu restaurante?'
      case 2: return '¿Cuál es tu categoría principal?'
      case 3: return 'Agrega tu primer producto'
      case 4: return 'Crea tu cuenta'
      default: return ''
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Ingresa el nombre de tu restaurante o negocio'
      case 2: return 'Selecciona el tipo de comida que ofreces'
      case 3: return 'Crea el primer elemento de tu menú'
      case 4: return 'Últimos datos para comenzar'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header with Progress */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#111827]">Mi Menú</h1>
            <div className="text-sm text-gray-600">
              Paso {currentStep} de 4
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#111827] h-2 rounded-full"
              initial={{ width: '25%' }}
              animate={{ width: `${(currentStep / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
            
            {/* Step Content */}
            <div className="min-h-[400px] flex flex-col">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {getStepTitle()}
                </h2>
                <p className="text-lg text-gray-600">
                  {getStepDescription()}
                </p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-md"
                    >
                      <input
                        type="text"
                        placeholder="Ej: Café Central, Pizzería Roma..."
                        value={formData.restaurantName}
                        onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent text-lg"
                        autoFocus
                      />
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-lg"
                    >
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {CATEGORY_OPTIONS.map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            className={`p-4 rounded-lg border-2 transition-all text-left hover:border-gray-300 ${
                              formData.category === category
                                ? 'border-[#111827] bg-gray-50 text-[#111827]'
                                : 'border-gray-200'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      {formData.category === 'Otro' && (
                        <input
                          type="text"
                          placeholder="Escribe tu categoría..."
                          value={formData.customCategory}
                          onChange={(e) => handleInputChange('customCategory', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                          autoFocus
                        />
                      )}
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-md space-y-4"
                    >
                      <input
                        type="text"
                        placeholder="Nombre del producto"
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent text-lg"
                      />
                      <input
                        type="text"
                        placeholder="Precio (ej: $1500)"
                        value={formData.productPrice}
                        onChange={(e) => handleInputChange('productPrice', e.target.value)}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent text-lg"
                      />
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-md space-y-4"
                    >
                      <input
                        type="email"
                        placeholder="Tu email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent text-lg"
                      />
                      <input
                        type="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111827] focus:border-transparent text-lg"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Anterior
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex items-center px-8 py-3 rounded-lg font-medium transition-colors ${
                      canProceed()
                        ? 'bg-[#111827] text-white hover:bg-gray-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Siguiente
                    <ChevronRightIcon className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleCreateAccount}
                    disabled={!canProceed() || isLoading}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      canProceed() && !isLoading
                        ? 'bg-[#111827] text-white hover:bg-gray-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        isOpen={snackbar.isOpen}
        onClose={hideSnackbar}
        message={snackbar.message}
        type={snackbar.type}
        duration={snackbar.duration}
        position={snackbar.position}
        action={snackbar.action}
      />
    </div>
  )
}

export default WelcomeWizard
