import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <Outlet />
      </main>
    </div>
  );
}
