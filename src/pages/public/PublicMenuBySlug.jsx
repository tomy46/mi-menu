import { useParams } from 'react-router-dom'
import SlugRouter from '../../components/SlugRouter'
import PublicMenuNew from './PublicMenuNew'

/**
 * Componente que maneja el menú público accedido por slug
 * Resuelve el slug a ID y renderiza el componente PublicMenuNew
 * Soporta dos formatos de URL:
 * - /:restaurantSlug (solo restaurante)
 * - /:restaurantSlug/:menuSlug (restaurante + menú específico)
 */
function PublicMenuBySlug() {
  return (
    <SlugRouter>
      {({ restaurant, menu }) => (
        <PublicMenuNew 
          restaurantId={restaurant.id}
          menuId={menu?.id}
          restaurant={restaurant}
          menu={menu}
        />
      )}
    </SlugRouter>
  )
}

export default PublicMenuBySlug
