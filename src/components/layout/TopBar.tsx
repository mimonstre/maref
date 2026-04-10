'use client';
import Link from 'next/link';
import { Bell, MessageSquare } from 'lucide-react';
import { USER } from '@/lib/data';

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
      <Link href="/" className="text-xl font-extrabold text-emerald-700 tracking-tight">MAREF</Link>
      <nav className="hidden md:flex items-center gap-1">
        {[
          { href: '/guide', label: 'Guide' },
          { href: '/profil', label: 'Profil' },
          { href: '/', label: 'Accueil' },
          { href: '/explorer', label: 'Explorer' },
          { href: '/projets', label: 'Projets' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MessageSquare className="w-5 h-5 text-gray-500" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <Link href="/profil" className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
          {USER.initials}
        </Link>
      </div>
    </header>
  );
}
