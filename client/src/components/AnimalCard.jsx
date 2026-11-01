import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AnimalCard({ animal }) {
  const [imageError, setImageError] = useState(false);

  // Era color indicator tags
  const eraColors = {
    0: '#64748b',
    1: '#059669',
    2: '#b45309',
    3: '#9333ea' // Monarch Purple
  };

  const badgeColor = eraColors[animal.era] || 'var(--accent)';

  return (
    <div
      className="encyclopedia-box"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        backgroundColor: 'var(--bg-card)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Edge-to-Edge Image Header Frame */}
      <div
        style={{
          width: '100%',
          height: '210px',
          position: 'relative',
          backgroundColor: '#09090b',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {animal.imageUrl && !imageError ? (
          <img
            src={animal.imageUrl}
            alt={animal.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, #27272a 0%, #09090b 100%)'
            }}
          >
            <span style={{ fontSize: '2.5rem', opacity: 0.7 }}>⚔️</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', letterSpacing: '1px' }}>
              {animal.animalClass || 'ARCHIVE SPECIMEN'}
            </span>
          </div>
        )}

        {/* Geological Period Badge */}
        <span
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: badgeColor,
            color: '#ffffff',
            fontSize: '0.72rem',
            padding: '3px 10px',
            borderRadius: '4px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
          }}
        >
          {animal.timePeriod || 'Cenozoic'}
        </span>
      </div>

      {/* Card Content */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3
          style={{
            margin: '0 0 6px 0',
            fontSize: '1.3rem',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-heading)'
          }}
        >
          {animal.name}
        </h3>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '18px'
          }}
        >
          <span>{animal.diet}</span>
          <span>•</span>
          <span>{animal.habitat}</span>
          <span>•</span>
          <span>{animal.massKg ? `${animal.massKg.toLocaleString()} kg` : 'N/A'}</span>
        </div>

        {/* Action Button */}
        <Link
          to={`/animal/${animal._id}`}
          style={{
            marginTop: 'auto',
            textAlign: 'center',
            backgroundColor: 'var(--bg-main)',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: '600',
            transition: 'background 0.2s ease, border-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-main)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          Inspect Specimen →
        </Link>
      </div>
    </div>
  );
}

export default AnimalCard;