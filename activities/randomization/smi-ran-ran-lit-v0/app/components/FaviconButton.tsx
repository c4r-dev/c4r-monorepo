'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function FaviconButton() {
  const router = useRouter();

  const handleRestart = () => {
    // Clear any localStorage data to reset the application state
    localStorage.clear();
    
    // Navigate to the root URL
    router.push('/');
    
    // Force a full page reload to completely restart the application
    window.location.href = '/';
  };

  return (
    <button 
      onClick={handleRestart}
      className="bg-transparent border-none p-0 cursor-pointer block outline-none"
      style={{ 
        border: 'none', 
        outline: 'none', 
        background: 'transparent' 
      }}
      aria-label="Restart application"
    >
      <Image 
        src="/favicon.ico" 
        alt="Site Logo" 
        className="favicon" 
        width={40} 
        height={40}
        priority
        style={{ background: 'transparent' }}
      />
    </button>
  );
}