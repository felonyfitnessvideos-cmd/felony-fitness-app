import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function SubPageHeader({ title, icon, iconColor = 'white', backTo }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '44px 1fr 44px',
      alignItems: 'center',
      marginBottom: '2rem'
    }}>
      <button 
        onClick={handleBack} 
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={28} />
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {React.cloneElement(icon, { color: iconColor })}
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>{title}</h1>
      </div>

      <div></div>
    </div>
  );
}

export default SubPageHeader;