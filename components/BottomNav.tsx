'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/home', label: '今日', icon: '📖' },
  { href: '/send', label: '届ける', icon: '✍️' },
  { href: '/library', label: '本棚', icon: '📚' },
  { href: '/shelf', label: '刺さった', icon: '✨' },
  { href: '/stats', label: '記録', icon: '📊' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 pb-safe">
      <div className="flex justify-around py-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
              pathname.startsWith(item.href)
                ? 'text-stone-700'
                : 'text-stone-300 hover:text-stone-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
