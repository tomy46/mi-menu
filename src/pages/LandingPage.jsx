import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChevronRightIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  QrCodeIcon,
  ChartBarIcon,
  CheckIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useSnackbar } from '../hooks/useSnackbar'
import Snackbar from '../components/Snackbar'

const features = [
  {
    icon: Squares2X2Icon,
    title: 'Organiza por Categorías',
    description: 'Estructura tu menú con categorías personalizadas. Arrastra y suelta para reordenar fácilmente.'
  },
  {
    icon: ShoppingBagIcon,
    title: 'Gestiona tus Productos',
    description: 'Agrega productos con precios, descripciones y restricciones alimenticias. Todo en un solo lugar.'
  },
  {
    icon: QrCodeIcon,
    title: 'Códigos QR Personalizados',
    description: 'Genera QR únicos o por mesa con tu logo y colores. Listos para imprimir en segundos.'
  },
  {
    icon: ChartBarIcon,
    title: 'Métricas Detalladas',
    description: 'Analiza visitas, productos populares y estadísticas por mesa. Toma decisiones basadas en datos.'
  }
]

const plans = [
  {
    name: 'Start',
    price: 'Gratis',
    period: '',
    description: 'Perfecto para empezar',
    features: [
      'Menú digital básico',
      'Hasta 3 categorías',
      'Hasta 15 productos',
      '1 usuario administrador',
      'Temas básicos',
      'Soporte por email'
    ],
    popular: false
  },
  {
    name: 'Pro',
    price: '$10.00',
    period: '/mes',
    description: 'Para restaurantes en crecimiento',
    features: [
      'Múltiples menús (hasta 5)',
      'Hasta 20 categorías',
      'Hasta 50 productos',
      'Hasta 3 miembros del equipo',
      'Todos los temas disponibles',
      'Analytics básicos',
      'Redes sociales integradas',
      'Soporte prioritario'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99.99',
    period: '/mes',
    description: 'Para cadenas y franquicias',
    features: [
      'Menús ilimitados',
      'Categorías ilimitadas',
      'Productos ilimitados',
      'Miembros del equipo ilimitados',
      'Todos los temas + temas premium',
      'Analytics avanzados',
      'API personalizada',
      'White-label disponible',
      'Soporte 24/7',
      'Gestor de cuenta dedicado'
    ],
    popular: false
  }
]

const faqs = [
  {
    question: '¿Qué incluye el plan gratuito?',
    answer: 'Todos los planes incluyen 7 días de prueba gratuita con acceso completo a todas las funcionalidades.'
  },
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer: 'Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu panel de administración.'
  },
  {
    question: '¿Los códigos QR funcionan sin internet?',
    answer: 'Los códigos QR requieren conexión a internet para mostrar el menú actualizado en tiempo real.'
  },
  {
    question: '¿Puedo personalizar el diseño del menú?',
    answer: 'Sí, ofrecemos varios temas prediseñados y opciones de personalización para que coincida con tu marca.'
  },
  {
    question: '¿Hay límite en el número de visitas?',
    answer: 'No, no hay límites en las visitas a tu menú. Tus clientes pueden acceder las veces que quieran.'
  }
]

const LandingPage = () => {
  const { snackbar, hideSnackbar } = useSnackbar()
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* AppBar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-[#111827]">Mi Menú</h1>
            <Link
              to="/welcome-wizard"
              className="bg-[#111827] text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                La manera más sencilla de crear tu menú digital
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Crea una carta profesional en menos de 3 minutos. Sin conocimientos técnicos, sin complicaciones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/welcome-wizard"
                  className="bg-[#111827] text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg inline-flex items-center justify-center"
                >
                  Comenzar gratis
                  <ChevronRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/login"
                  className="border border-[#111827] bg-white text-[#111827] px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg inline-flex items-center justify-center"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>

            {/* Menu Preview Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
              <div className="h-96 rounded-lg overflow-hidden" style={{ backgroundColor: '#EDD2B1' }}>
                <div className="p-6 h-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#2A1C0C' }}>
                      Restaurante Demo
                    </h2>
                  </div>

                  {/* Category Section */}
                  <div className="mb-6">
                    <h3 
                      className="text-lg font-semibold mb-4 pb-2"
                      style={{ 
                        color: '#2A1C0C',
                        borderBottom: '1px solid #D4B896'
                      }}
                    >
                      🍽️ Platos Principales
                    </h3>
                    
                    <div className="space-y-3">
                      <div
                        className="rounded-lg p-3"
                        style={{ 
                          backgroundColor: 'transparent',
                          border: '1px solid #D4B896'
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium" style={{ color: '#2A1C0C' }}>
                              Bandeja Paisa
                            </h4>
                            <p className="text-sm opacity-75" style={{ color: '#2A1C0C' }}>
                              Tradicional plato colombiano
                            </p>
                          </div>
                          <span className="font-semibold" style={{ color: '#2A1C0C' }}>
                            $25.000
                          </span>
                        </div>
                      </div>
                      
                      <div
                        className="rounded-lg p-3"
                        style={{ 
                          backgroundColor: 'transparent',
                          border: '1px solid #D4B896'
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium" style={{ color: '#2A1C0C' }}>
                              Ajiaco Santafereño
                            </h4>
                            <p className="text-sm opacity-75" style={{ color: '#2A1C0C' }}>
                              Sopa típica bogotana
                            </p>
                          </div>
                          <span className="font-semibold" style={{ color: '#2A1C0C' }}>
                            $18.000
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu menú digital
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas profesionales diseñadas para restaurantes modernos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-[#111827]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes para cada tipo de restaurante
            </h2>
            <p className="text-xl text-gray-600">
              Comienza gratis y escala según tus necesidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-lg border-2 p-8 relative ${
                  plan.popular ? 'border-[#111827] shadow-lg' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#111827] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/welcome-wizard"
                  className={`w-full py-3 px-6 rounded-lg font-medium text-center block transition-colors ${
                    plan.popular
                      ? 'bg-[#111827] text-white hover:bg-gray-800'
                      : 'border border-[#111827] text-[#111827] hover:bg-gray-50'
                  }`}
                >
                  {plan.name === 'Start' ? 'Comenzar gratis' : 'Comenzar prueba gratuita'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-xl text-gray-600">
              Resolvemos las dudas más comunes sobre Mi Menú
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronDownIcon 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Mi Menú</h3>
            <p className="text-gray-400 mb-8">
              La plataforma más sencilla para crear menús digitales profesionales
            </p>
            <div className="flex justify-center space-x-8">
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/welcome-wizard" className="text-gray-400 hover:text-white transition-colors">
                Comenzar gratis
              </Link>
            </div>
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
