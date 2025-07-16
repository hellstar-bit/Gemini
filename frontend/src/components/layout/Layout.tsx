import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationContainer } from '../common/NotificationContainer';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-primary-50/30">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-50/20 pointer-events-none"></div>
        <div className="relative z-10 p-8">
          <Outlet />
        </div>
      </main>
      <NotificationContainer />
    </div>
  );
};