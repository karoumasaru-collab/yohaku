'use client'

import { useEffect, useState } from 'react'

interface Props {
  onComplete?: () => void
}

export default function HitAnimation({ onComplete }: Props) {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; delay: number }[]>([])

  useEffect(() => {
    const newStars = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      delay: Math.random() * 0.3,
    }))
    setStars(newStars)

    const timer = setTimeout(() => onComplete?.(), 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="relative">
        <div className="text-5xl animate-ping">✨</div>
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute text-xl animate-ping"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: '0.8s',
            }}
          >
            ⭐
          </div>
        ))}
      </div>
    </div>
  )
}
