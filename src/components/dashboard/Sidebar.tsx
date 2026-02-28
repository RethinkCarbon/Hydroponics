import { 
  LayoutDashboard, 
  Thermometer,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserRole } from '@/types/greenhouse';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: UserRole;
  activeAlertsCount: number;
  criticalAlertsCount: number;
  onLogout: () => void;
  /** Mobile: sidebar open state (drawer visible when true) */
  open?: boolean;
  /** Mobile: close drawer after nav or when backdrop clicked */
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: 'red' | 'yellow';
  adminOnly?: boolean;
  children?: { id: string; label: string }[];
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { 
    id: 'operations', 
    label: 'Operations', 
    icon: Thermometer,
    children: [
      { id: 'climate', label: 'Climate Control' },
      { id: 'lighting', label: 'Light & Shade' },
      { id: 'irrigation', label: 'Irrigation' },
      { id: 'ec', label: 'EC Controller' },
      { id: 'ph', label: 'pH Controller' },
      { id: 'uv', label: 'UV Treatment' },
    ]
  },
  { 
    id: 'workstreams', 
    label: 'Workstreams', 
    icon: BarChart3,
    children: [
      { id: 'certification', label: 'Batch Certification' },
      { id: 'market', label: 'Live Market Prices' },
      { id: 'sales', label: 'Sales Pipeline' },
      { id: 'economics', label: 'Crop Economics' },
      { id: 'inventory', label: 'Inventory' },
    ]
  },
  { id: 'alerts', label: 'Alerts & Safety', icon: ShieldAlert, badge: 0, badgeColor: 'red' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
];

// Planetive Logo Component
function PlanetiveLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Three Teal Stripes Stacked Vertically */}
      <div className="flex flex-col gap-1">
        <div className="w-10 h-1.5 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
        <div className="w-10 h-1.5 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full" />
        <div className="w-10 h-1.5 bg-gradient-to-r from-teal-600 to-teal-800 rounded-full" />
      </div>
      <div>
        <h1 className="font-bold text-slate-800 text-sm leading-tight">Greenhouse</h1>
        <h1 className="font-bold text-slate-800 text-sm leading-tight">Control System</h1>
        <p className="text-[10px] text-teal-600 font-medium tracking-wide">POWERED BY PLANETIVE</p>
      </div>
    </div>
  );
}

export function Sidebar({ 
  activeView, 
  onViewChange, 
  userRole, 
  activeAlertsCount, 
  criticalAlertsCount,
  onLogout,
  open = false,
  onClose
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['operations', 'workstreams']);

  const handleViewChange = (view: string) => {
    onViewChange(view);
    onClose?.();
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const visibleNavItems = navItems.filter(item => !item.adminOnly || userRole === 'admin');

  return (
    <>
      {/* Mobile backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close menu"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <aside
        className={`nav-sidebar w-64 max-w-[85vw] h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile: close button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
          <PlanetiveLogo />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Desktop: logo only */}
        <div className="hidden lg:block p-5 border-b border-slate-200">
          <PlanetiveLogo />
        </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-3">
        <div className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.id);
            const isParentOfActive = hasChildren && item.children?.some(c => c.id === activeView);
            const isTabHighlighted = (isActive && !hasChildren) || isParentOfActive;
            const alertCount = item.id === 'alerts' ? activeAlertsCount : undefined;
            const hasCritical = item.id === 'alerts' && criticalAlertsCount > 0;
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleSection(item.id);
                    } else {
                      handleViewChange(item.id);
                    }
                  }}
                  className={`nav-item w-full relative ${isTabHighlighted ? 'active' : ''}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isTabHighlighted ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {alertCount !== undefined && alertCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      hasCritical 
                        ? 'bg-red-500 text-white' 
                        : 'bg-amber-500 text-white'
                    }`}>
                      {alertCount}
                    </span>
                  )}
                  {hasChildren && (
                    <span className={isTabHighlighted ? 'text-teal-600' : 'text-slate-400'}>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                  )}
                </button>
                
                {/* Child Items */}
                {hasChildren && isExpanded && item.children && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {item.children.map((child) => {
                      const isChildActive = activeView === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleViewChange(child.id)}
                          className={`nav-item w-full text-sm pl-4 ${isChildActive ? 'active' : ''}`}
                        >
                          <span className="flex-1 text-left font-medium">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Account – click to open dropdown with Settings & Logout */}
      <div className="p-4 border-t border-slate-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {userRole === 'admin' ? 'Administrator' : 'Operator'}
                </p>
                <p className="text-xs text-slate-500 capitalize">{userRole}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem onClick={() => handleViewChange('settings')}>
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
    </>
  );
}
