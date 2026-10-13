import { useState } from 'react'
import { Link } from 'react-router-dom'

/** Put the real logo at public/zenve-logo.png. Until then a simple placeholder shows. */
export default function Logo() {
  const [missing, setMissing] = useState(false)
  return (
    <Link to="/" className="logo" aria-label="Zenve Vet home">
      {missing ? (
        <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" fill="#f3ead2" stroke="#c9a24a" strokeWidth="2" />
          <path d="M26 12v28" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ) : (
        <img src="/zenve-logo.png" alt="" width="52" height="52" onError={() => setMissing(true)} />
      )}
      <span>
        <span className="logo__name">ZENVE VET<sup>™</sup></span>
        <span className="logo__tag">The professional network</span>
      </span>
    </Link>
  )
}
