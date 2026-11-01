import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: 'none',
          color: 'var(--text-main)',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          fontFamily: 'var(--font-heading)'
        }}
      >
        Wildlife Archive
      </Link>

      <div style={{ display: 'flex', gap: '20px' }}>
        <Link
          to="/"
          style={{
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Home
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;