import { useParams } from 'react-router-dom'
import SlugRouter from '../../components/SlugRouter'
import PublicMenuNew from './PublicMenuNew'

/**
 * Componente que maneja el menú público accedido por slug
 * Resuelve el slug a ID y renderiza el componente PublicMenuNew
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
