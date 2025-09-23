import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { createRestaurantFromWizard } from '../services/firestore'
import { useSnackbar } from '../hooks/useSnackbar'
import Snackbar from '../components/Snackbar'

const CATEGORY_OPTIONS = [
  'Café',
  'Bebidas', 
  'Plato principal',
  'Postres',
  'Aperitivos',
  'Otro'
]

const LandingPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { snackbar, showError, showSuccess, hideSnackbar } = useSnackbar()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    storeName: '',
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
    // Validate current step before proceeding
    if (!canProceed()) {
      switch (currentStep) {
        case 1:
          showError('Por favor ingresa el nombre de tu negocio')
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

  const handleCategorySelect = (category) => {
    handleInputChange('category', category)
    if (category !== 'Otro') {
      handleInputChange('customCategory', '')
    }
  }

  const handleCreateAccount = async () => {
    // Validate final step
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
        storeName: formData.storeName,
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
        return formData.storeName.trim() !== ''
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

  const getDisplayCategory = () => {
    return formData.category === 'Otro' ? formData.customCategory : formData.category
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* AppBar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#111827]">Mi Menú</h1>
            </div>
            <Link
              to="/login"
              className="border border-[#111827] bg-white text-[#111827] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column - Wizard */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Paso {currentStep} de 4</span>
                <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-[#FF7A00] h-2 rounded-full"
                  initial={{ width: '25%' }}
                  animate={{ width: `${(currentStep / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Wizard Steps */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cómo se llama tu negocio?</h2>
                    <p className="text-gray-600 mb-6">Ingresa el nombre de tu restaurante o negocio</p>
                    <input
                      type="text"
                      placeholder="Ej: Café Central, Pizzería Roma..."
                      value={formData.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent text-lg"
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
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cuál es tu categoría principal?</h2>
                    <p className="text-gray-600 mb-6">Selecciona el tipo de comida que ofreces</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {CATEGORY_OPTIONS.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            formData.category === category
                              ? 'border-[#FF7A00] bg-orange-50 text-[#FF7A00]'
                              : 'border-gray-200 hover:border-gray-300'
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
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
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Agrega tu primer producto</h2>
                    <p className="text-gray-600 mb-6">Crea el primer elemento de tu menú</p>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Nombre del producto"
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Precio (ej: $1500)"
                        value={formData.productPrice}
                        onChange={(e) => handleInputChange('productPrice', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta</h2>
                    <p className="text-gray-600 mb-6">Últimos datos para comenzar</p>
                    <div className="space-y-4">
                      <input
                        type="email"
                        placeholder="Tu email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Next Button */}
            <div className="mt-8">
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                    canProceed()
                      ? 'bg-[#FF7A00] text-white hover:bg-orange-600'
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
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                    canProceed() && !isLoading
                      ? 'bg-[#FF7A00] text-white hover:bg-orange-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Phone mockup */}
              <div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden" style={{ backgroundColor: '#F5F0E8' }}>
                  {/* Menu Preview */}
                  <div className="p-6 h-full overflow-y-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {/* Header */}
                    <div className="text-center mb-8">
                      {formData.storeName && (
                        <motion.h1
                          className="text-2xl font-bold mb-2"
                          style={{ color: '#4A3728' }}
                          key={formData.storeName}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {formData.storeName}
                        </motion.h1>
                      )}
                    </div>

                    {/* Category Section */}
                    {getDisplayCategory() && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-6"
                      >
                        <h2 
                          className="text-lg font-semibold mb-4 pb-2"
                          style={{ 
                            color: '#4A3728',
                            borderBottom: '1px solid #E8D5B7'
                          }}
                        >
                          {getDisplayCategory()}
                        </h2>
                        
                        {formData.productName && formData.productPrice ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-lg p-4"
                            style={{ 
                              backgroundColor: 'transparent',
                              border: '1px solid #E8D5B7'
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium" style={{ color: '#4A3728' }}>
                                  {formData.productName}
                                </h3>
                              </div>
                              <span className="font-semibold" style={{ color: '#4A3728' }}>
                                {formData.productPrice}
                              </span>
                            </div>
                          </motion.div>
                        ) : (
                          <div 
                            className="rounded-lg p-4 text-center"
                            style={{ 
                              backgroundColor: 'transparent',
                              border: '1px dashed #E8D5B7',
                              color: '#4A3728',
                              opacity: 0.6
                            }}
                          >
                            Agregá tu primer producto
                          </div>
                        )}
                      </motion.div>
                    )}

                    {!formData.storeName && !getDisplayCategory() && (
                      <div className="text-center mt-12" style={{ color: '#4A3728', opacity: 0.6 }}>
                        <p>Tu menú aparecerá aquí</p>
                        <p className="text-sm mt-2">Completá los pasos para ver la vista previa</p>
                      </div>
                    )}

                    {formData.storeName && !getDisplayCategory() && (
                      <div className="text-center mt-12" style={{ color: '#4A3728', opacity: 0.6 }}>
                        <p>Seleccioná una categoría para continuar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Mi Menú</h3>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

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

export default LandingPage
