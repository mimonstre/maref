'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, FolderOpen, BookOpen, User } from 'lucide-react';

const items = [
  { href: '/guide', label: 'Guide', icon: BookOpen },
  { href: '/profil', label: 'Profil', icon: User },
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/explorer', label: 'Explorer', icon: Search },
  { href: '/projets', label: 'Projets', icon: FolderOpen },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-1 z-50 md:hidden">
      {items.map(item => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ' + (active ? 'text-emerald-700' : 'text-gray-400 hover:text-emerald-600')}>
            <item.icon className="w-5 h-5" />
            <span className="text-[0.65rem] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
