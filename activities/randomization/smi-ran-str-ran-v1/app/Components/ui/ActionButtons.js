 const ActionButtons = ({ onFlipOnce }) => {
    return (
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button 
          onClick={onFlipOnce} 
          style={{ 
            margin: '8px',
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-general-sans-semi-bold)'
          }}
        >
          FLIP ONCE
        </button>
        <button 
          disabled 
          style={{ 
            margin: '8px',
            padding: '8px 16px',
            backgroundColor: '#cccccc',
            color: '#666666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'not-allowed',
            fontFamily: 'var(--font-general-sans-semi-bold)'
          }}
        >
          FLIP FOR ALL
        </button>
      </div>
    );
  };


  export default ActionButtons;