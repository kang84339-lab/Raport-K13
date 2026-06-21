import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS } from '@/lib/k13utils';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const userRole = user?.role || 'student';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar userRole={userRole} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden">
          <Sidebar userRole={userRole} collapsed={false} onToggle={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="font-heading font-semibold text-foreground text-lg hidden sm:block">
              Rapor Digital K13
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {ROLE_LABELS[userRole] || userRole}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.full_name?.[0] || 'U'}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}