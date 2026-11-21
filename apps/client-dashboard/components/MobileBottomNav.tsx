'use client';

import React, { useState, useEffect } from 'react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '/', icon: '🏛️' },
  { id: 'journey', label: 'Journey', href: '/#journey', icon: '⚡' },
  { id: 'vault', label: 'Vault', href: '/documents', icon: '📂' },
  { id: 'stream', label: 'Live AI', href: '/live-stream', icon: '📡' },
  { id: 'messages', label: 'Messages', href: '/messages', icon: '💬' },
];

export function MobileBottomNav() {
  const [activeItem, setActiveItem] = useState<string>('home');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (path.includes('/documents')) setActiveItem('vault');
    else if (path.includes('/live-stream')) setActiveItem('stream');
    else if (path.includes('/messages')) setActiveItem('messages');
    else if (window.location.hash.includes('journey')) setActiveItem('journey');
    else setActiveItem('home');
  }, []);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-xl px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      aria-label="Mobile Bottom Navigation"
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-[#0D3B2E] font-bold'
                  : 'text-[#64748B] hover:text-[#0D3B2E] font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#C8A951]" />
                )}
              </span>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
