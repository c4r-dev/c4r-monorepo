// app/page.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  const openModal = (url: string) => {
    setModalUrl(url);
  };

  const closeModal = () => {
    setModalUrl(null);
  };

  return (
    <div className="landing-container">
      <h2>C4R Graduate Course Units</h2>
      <div className="applications-grid">
        <div className="app-card">
          <h3>Controls</h3>
          <p>Graduate-level control systems theory and applications</p>
          <div className="button-group">
            <button 
              className="button" 
              onClick={() => openModal('https://www.c4r.io/units-meeting/controls')}
            >
              Meeting
            </button>
            <button 
              className="button" 
              onClick={() => openModal('https://www.c4r.io/unit-class/controls')}
            >
              Class
            </button>
            <button 
              className="button" 
              onClick={() => openModal('https://www.c4r.io/unit-books/controls')}
            >
              Book
            </button>
          </div>
        </div>
        
        <div className="app-card">
          <h3>Randomization</h3>
          <p>Statistical randomization methods and experimental design</p>
          <div className="button-group">
            <button 
              className="button" 
              onClick={() => openModal('https://www.c4r.io/units-meeting/randomization')}
            >
              Meeting
            </button>
            <button 
              className="button" 
              onClick={() => openModal('https://www.c4r.io/unit-class/randomization')}
            >
              Class
            </button>
            <button 
              className="button" 
              onClick={() => openModal('https://www.c4r.io/unit-books/randomization')}
            >
              Book
            </button>
          </div>
        </div>
        
        <div className="app-card">
          <h3>Confirmation Bias</h3>
          <p>Cognitive bias analysis and research methodology</p>
          <div className="button-group">
            <button 
              className="button" 
              onClick={() => openModal('https://www.c4r.io/units-meeting/confirmation-bias')}
            >
              Meeting
            </button>
            <button 
              className="button" 
              onClick={() => openModal('https://www.c4r.io/unit-class/confirmation-bias')}
            >
              Class
            </button>
            <button 
              className="button" 
              onClick={() => openModal('https://www.c4r.io/unit-books/confirmation-bias')}
            >
              Book
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalUrl && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-url">{modalUrl}</div>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <iframe
              src={modalUrl}
              className="modal-iframe"
              title="Course Content"
            />
          </div>
        </div>
      )}
    </div>
  );
}