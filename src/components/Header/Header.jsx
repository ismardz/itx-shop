import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import './Header.css'

export default function Header() {
  const { cartCount } = useCart()
  const location = useLocation()

  const isDetailPage = location.pathname.startsWith('/product/')
  const isListPage = location.pathname === '/'

  return (
    <header className="header">
      <div className="header__top">
        <Link to="/" className="header__title">
          <span className="header__logo" aria-hidden="true">📱</span>
          <span className="header__brand">ITX Shop</span>
        </Link>
        <div className="header__cart" aria-label={`Cart with ${cartCount} items`}>
          <span className="header__cart-icon" aria-hidden="true">🛒</span>
          <span className="header__cart-count" data-testid="cart-count">
            {cartCount}
          </span>
        </div>
      </div>
      <nav className="header__breadcrumbs" aria-label="breadcrumbs">
        <Link to="/" className="header__breadcrumb-link">
          Products
        </Link>
        {isDetailPage && (
          <>
            <span className="header__breadcrumb-separator" aria-hidden="true">/</span>
            <span className="header__breadcrumb-current">Product details</span>
          </>
        )}
        {isListPage && (
          <span className="header__breadcrumb-separator" aria-hidden="true">/</span>
        )}
        {isListPage && <span className="header__breadcrumb-current">List</span>}
      </nav>
    </header>
  )
}
