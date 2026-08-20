import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <span className="notfound-icon">
        <ShoppingBag size={22} />
      </span>
      
      <p className="notfound-code">404</p>

      <p className="notfound-text">
        This aisle doesn&rsquo;t exist. The page you&rsquo;re looking for may
        have been moved or removed.
      </p>
      
      <Link to="/" className="notfound-cta">
        Back to home
      </Link>
    </div>
  )
}
