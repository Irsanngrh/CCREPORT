import React from 'react';
import Sidebar from './Sidebar.jsx';

export default function Layout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
