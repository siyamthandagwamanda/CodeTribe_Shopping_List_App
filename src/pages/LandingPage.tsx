import { Link, Navigate } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'

export default function LandingPage() {
  const user = useAppSelector((s) => s.auth.user)
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="app">
      <header className="landing-header">
        <div className="brand">
          <span className="brand__icon">
            <ShoppingBag size={16} strokeWidth={2.25} />
          </span>
          <span className="brand__name">ShopSort.</span>
        </div>
        <div className="landing-header__actions">
          <Link to="/login" className="landing-header__login">
            Log In
          </Link>
          <Link to="/register" className="landing-header__signup">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="landing-main">
        <div className="landing-grid">
          <div>
            <span className="eyebrow">Smart shopping companion</span>
            <h1 className="hero-title">
              List it.
              <br />
              Grab it.
              <br />
              Done.
            </h1>
            <p className="hero-sub">
              Build shopping lists that sort themselves, sync across every
              trip, and make sure nothing gets left behind at checkout.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">
                Get started free
                <ArrowRight size={15} />
              </Link>
              <Link to="/login" className="btn btn-outline">
                I already have an account
              </Link>
            </div>
          </div>

          <HeroIllustration />
        </div>
      </main>

      <footer className="landing-footer">
        {new Date().getFullYear()} ShopSort @Mlab 26/27 Cohort&middot; a smarter shopping list
      </footer>
    </div>
  )
}
/**
 * Hero illustration:
 * The visual direction was informed by researched design references and
 * existing shopping-list illustrations. The illustration was then
 * developed specifically for ShopSort as part of my own UI concept and
 * implementation.
 */

function HeroIllustration() {
  return (
    <div className="hero-illustration">
      <svg viewBox="0 0 320 260" role="presentation">
        <rect x="86" y="90" width="120" height="130" rx="10" fill="var(--color-forest)" />
        <path d="M104 90 V64a26 26 0 0 1 52 0v26" fill="none" stroke="var(--color-forest-dark)" strokeWidth="9" strokeLinecap="round" />
        <circle cx="150" cy="120" r="16" fill="var(--color-coral)" />
        <circle cx="176" cy="112" r="12" fill="var(--color-clay-ink)" opacity="0.85" />
        <rect x="130" y="140" width="52" height="16" rx="8" fill="var(--color-sage)" />

        <g transform="translate(178 40)">
          <rect x="0" y="0" width="120" height="120" rx="14" fill="var(--color-paper)" stroke="var(--color-sage-line)" strokeWidth="2" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(14 ${20 + i * 30})`}>
              <rect width="18" height="18" rx="5" fill={i < 2 ? 'var(--color-forest)' : 'none'} stroke="var(--color-forest)" strokeWidth="2" />
              {i < 2 && (
                <path d="M4 9 l4 4 l7 -8" fill="none" stroke="var(--color-cream-soft)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              )}
              <rect x="28" y="4" width="70" height="10" rx="5" fill="var(--color-sage)" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
