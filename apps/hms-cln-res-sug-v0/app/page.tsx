// app/page.tsx
'use client';

import CodingResourceQuiz from './components/CodingResourceQuiz';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <CodingResourceQuiz />
    </div>
  );
}