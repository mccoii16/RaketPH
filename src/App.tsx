import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './components/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
