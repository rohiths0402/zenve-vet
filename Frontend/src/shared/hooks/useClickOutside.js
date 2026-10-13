import { useEffect } from 'react'

/** Calls handler when a mousedown/touch happens outside `ref`, or Escape is pressed. */
export default function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) handler() }
    const onKey = (e) => { if (e.key === 'Escape') handler() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, handler, active])
}
