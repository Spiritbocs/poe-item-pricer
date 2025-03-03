'use client';

import Navbar from '@/components/Navbar';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-[#af6025] mb-6">
          Path of Exile Character Armory
        </h1>
        
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#af6025]"></div>
        </div>
      </main>
    </div>
  );
}
