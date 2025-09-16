import React from 'react';
import FishTank  from './FishTank';

const FishGroups = ({ controlFish, treatmentFish }) => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginTop: '32px',
        width: '100%'
      }}>
        {/* Control Group Tank */}
        <FishTank 
          fishList={controlFish} 
          backgroundColor="#1E90FF" 
          title="CONTROL GROUP" 
          containerStyle={{
            backgroundColor: '#ADD8E6',
            height: '300px',
            width: '100%',
            borderRadius: '8px',
            padding: '16px'
          }}
        />
        
        {/* Treatment Group Tank */}
        <FishTank 
          fishList={treatmentFish} 
          backgroundColor="#FF69B4" 
          title="TREATMENT GROUP" 
          containerStyle={{
            backgroundColor: '#FFC0CB',
            height: '300px',
            width: '100%',
            borderRadius: '8px',
            padding: '16px'
          }}
        />
      </div>
    );
  };

  export default FishGroups;