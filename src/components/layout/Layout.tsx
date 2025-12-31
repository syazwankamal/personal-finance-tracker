import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col relative app-container">
            {/* Scrollable Main Content */}
            <main className="flex-1 pb-32">
                <Outlet />
            </main>

            {/* Persistent Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default Layout;
