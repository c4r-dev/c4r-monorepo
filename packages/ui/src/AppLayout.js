import React from 'react';
import Header from './components/Header';
import './layout.css';

export function AppLayout({ title, children }) {
  return (
    <div className="app-container">
      <Header text={title} />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
}
