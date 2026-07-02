import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare, Clock,
  Calendar, UserCheck, Bell, BarChart3, List, Megaphone,
  Settings, AlertTriangle, Video, ChevronLeft, ChevronRight,
  LogOut, Briefcase
} from 'lucide-react';
import { authService } from '@/services/auth.service';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Team Members', icon: Users, path: '/team' },
  { label: 'Buckets', icon: FolderKanban, path: '/buckets' },
  { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { label: 'Timesheets', icon: Clock, path: '/timesheets' },
  { label: 'Calendar', icon: Calendar, path: '/calendar' },
  { label: 'Attendance', icon: UserCheck, path: '/attendance' },
  { label: 'External Alerts', icon: AlertTriangle, path: '/alerts' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Item List', icon: List, path: '/items' },
  { label: 'Notice Board', icon: Megaphone, path: '/notices' },
  { label: 'Meetings', icon: Video, path: '/meetings' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[hsl(222,47%,11%)] text-[hsl(213,31%,91%)] z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/10">
        <Briefcase className="w-7 h-7 text-blue-400 shrink-0" />
        {!collapsed && <span className="ml-3 font-bold text-lg tracking-tight text-white">WorkForce</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
              ${isActive(item.path)
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }
              ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-2 space-y-1">
        <button
          onClick={() => authService.logout()}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white w-full transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={onToggle}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white w-full transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}