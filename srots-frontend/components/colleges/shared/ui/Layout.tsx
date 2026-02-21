import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, LogOut, User as UserIcon, LayoutDashboard, Briefcase,
  Calendar, Users, Building, BookOpen, PenTool, Home, CheckSquare,
  Layers, Shield
} from 'lucide-react';
import { Role, User } from '../../../../types';
import { CollegeService } from '../../../../services/collegeService';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  onNavigate: (view: string) => void;
  currentView: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, children, onNavigate, currentView, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [collegeName, setCollegeName] = useState('Srots Platform');
  const [collegeLogo, setCollegeLogo] = useState<string>('');
  const [collegeCode, setCollegeCode] = useState<string>('');
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (user.collegeId) {
      CollegeService.getCollegeById(user.collegeId).then(college => {
        if (college) {
          setCollegeName(college.name);
          setCollegeLogo(college.logo);
          setCollegeCode(college.code);
        }
      }).catch(err => console.error("Failed to fetch college", err));
    }
  }, [user.collegeId]);

  const getNavItems = () => {
    switch (user.role) {
      case Role.ADMIN:
      case Role.SROTS_DEV:
        return [
          { id: 'profile', label: 'My Profile', icon: <UserIcon size={20} /> },
          { id: 'cms', label: 'CMS (Colleges)', icon: <Building size={20} /> },
          { id: 'srots-team', label: 'Srots Team', icon: <Users size={20} /> },
          { id: 'companies', label: 'Companies Master', icon: <Briefcase size={20} /> },
          { id: 'analytics', label: 'Global Analytics', icon: <LayoutDashboard size={20} /> },
          { id: 'about-srots', label: 'About Srots', icon: <Home size={20} /> },
          { id: 'free-courses', label: 'Free Courses', icon: <BookOpen size={20} /> },
        ];
      case Role.CPH:
      case Role.STAFF:
        const items = [
          { id: 'profile', label: 'My Profile', icon: <UserIcon size={20} /> },
          { id: 'jobs', label: 'Job Postings', icon: <Briefcase size={20} /> },
          { id: 'calendar', label: 'Events & Drives', icon: <Calendar size={20} /> },
          { id: 'students', label: 'Student Directory', icon: <Users size={20} /> },
          { id: 'companies', label: 'Partner Companies', icon: <Building size={20} /> },
          { id: 'free-courses', label: 'Free Courses', icon: <BookOpen size={20} /> },
          { id: 'cms-college', label: 'College Profile', icon: <Home size={20} /> },
          { id: 'posts', label: 'Social Feed', icon: <PenTool size={20} /> },
        ];
        if (user.role === Role.CPH) {
          items.push({ id: 'team', label: 'Manage Team', icon: <Shield size={20} /> });
          items.push({ id: 'analytics', label: 'Placement Stats', icon: <LayoutDashboard size={20} /> });
        }
        return items;
      case Role.STUDENT:
        return [
          { id: 'profile', label: 'My Resume/Profile', icon: <UserIcon size={20} /> },
          { id: 'jobs', label: 'Available Jobs', icon: <Briefcase size={20} /> },
          { id: 'tracker', label: 'App Status', icon: <CheckSquare size={20} /> },
          { id: 'calendar', label: 'Drive Schedule', icon: <Calendar size={20} /> },
          { id: 'companies', label: 'Top Companies', icon: <Building size={20} /> },
          { id: 'free-courses', label: 'Free Courses', icon: <BookOpen size={20} /> },
          { id: 'about-college', label: 'About College', icon: <Home size={20} /> },
          { id: 'posts', label: 'Campus Feed', icon: <Layers size={20} /> },
          { id: 'premium', label: 'Premium Membership', icon: <Shield size={20} className="text-amber-500" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const isCollapsed = !isSidebarOpen && !isMobile;

  const handleNavClick = (view: string) => {
    onNavigate(view);
    const prefix = user.role === Role.STUDENT
      ? 'student'
      : (user.role === Role.ADMIN || user.role === Role.SROTS_DEV)
        ? 'admin'
        : 'cp';
    navigate(`/${prefix}/${view}`);
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
      <header className="bg-white border-b h-16 flex-none flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {isSidebarOpen && isMobile ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-3">
            {user.role === Role.ADMIN || user.role === Role.SROTS_DEV ? (
              <span className="font-bold text-2xl text-blue-600 tracking-tight">Srots</span>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                {collegeLogo && (
                  <img
                    src={collegeLogo}
                    alt={collegeName}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-gray-200 bg-white"
                  />
                )}
                <span className="font-bold text-sm md:text-lg text-blue-600 leading-tight truncate max-w-[150px] md:max-w-none">
                  {collegeName}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-gray-800">{user.fullName}</span>
            <span className={`text-[8px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-extrabold uppercase tracking-widest mt-0.5 shadow-sm`}>
              {user.role}
            </span>
            {user.role === Role.STUDENT && user.premiumActive && (
              <span className="text-[8px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold uppercase tracking-widest mt-1 shadow-sm flex items-center gap-1">
                <Shield size={8} /> PREMIUM
              </span>
            )}
          </div>
          {user.avatar && (
            <img
              src={user.avatar}
              alt="Profile"
              className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 object-cover shadow-sm ring-2 ring-white"
            />
          )}
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-40 
            ${isMobile
              ? `absolute inset-y-0 left-0 h-full shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
              : `relative h-full ${isSidebarOpen ? 'w-64' : 'w-20'}`}`}
          style={isMobile ? { width: '16rem' } : {}}
        >
          <div className={`hidden md:flex p-6 border-b items-center justify-center h-20 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            {user.role === Role.ADMIN || user.role === Role.SROTS_DEV ? (
              <span className="font-bold text-2xl text-blue-600">Srots</span>
            ) : (
              <div className="flex items-center gap-2">
                <Building className="text-blue-600" size={24} />
                <span className="font-bold text-xl text-gray-800 truncate max-w-[150px] uppercase tracking-tighter">
                  {collegeCode || 'PORTAL'}
                </span>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-bold whitespace-nowrap overflow-hidden ${currentView === item.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={`transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap overflow-hidden ${isCollapsed ? 'justify-center' : ''
                }`}
              title="Logout"
            >
              <LogOut size={16} className="flex-shrink-0" />
              <span className={`transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                Logout
              </span>
            </button>
          </div>
        </aside>

        {isMobile && isSidebarOpen && (
          <div
            className="absolute inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50 w-full relative">
          <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};