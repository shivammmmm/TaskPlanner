import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Plus, Settings, HelpCircle, Menu, User, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { settingsService } from '@/services/settings.service';
import { authService } from '@/services/auth.service';

export default function TopHeader({ onMobileMenuToggle, employee }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (employee) {
      settingsService.getNotifications(employee.user_id)
        .then(n => setUnreadCount(n.filter(x => !x.is_read).length))
        .catch(err => console.error(err));
    }
  }, [employee]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onMobileMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div className="relative hidden md:block w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search tasks, members, buckets..."
            className="pl-9 h-10 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Quick Add */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Add</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild><Link to="/tasks?new=1">New Task</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/buckets?new=1">New Bucket</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/team?new=1">New Member</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/meetings?new=1">New Meeting</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/notices?new=1">New Notice</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Meeting */}
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link to="/meetings"><Video className="w-4 h-4 text-slate-600" /></Link>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative" asChild>
          <Link to="/notifications">
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex" asChild>
          <Link to="/settings"><Settings className="w-4 h-4 text-slate-600" /></Link>
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex">
          <HelpCircle className="w-4 h-4 text-slate-600" />
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-2 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {employee?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900 leading-tight">{employee?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 leading-tight capitalize">{employee?.role?.replace('_', ' ') || 'Employee'}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild><Link to="/profile">My Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => authService.logout()} className="text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}