import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import AnimalCard from '../components/AnimalCard';

const ERA_LABELS = {
  0: 'Precambrian',
  1: 'Paleozoic',
  2: 'Mesozoic',
  3: 'Cenozoic'
};

function Home() {
  const navigate = useNavigate();

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [selectedHabitat, setSelectedHabitat] = useState('All');
  const [selectedEra, setSelectedEra] = useState('All');
  const [selectedSort, setSelectedSort] = useState('name_asc');

  // Pagination & Data
  const [animals, setAnimals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Suggestions Dropdown
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef(null);

  // Close typeahead on outer click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick live suggestions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get(`/animals?search=${encodeURIComponent(searchTerm.trim())}&limit=6`);
        setSuggestions(res.data.animals || res.data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to Page 1 whenever query parameters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedDiet, selectedHabitat, selectedEra, selectedSort]);

  // Main Fetch Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSpecimens(page);
    }, 200);

    return () => clearTimeout(timer);
  }, [page, searchTerm, selectedDiet, selectedHabitat, selectedEra, selectedSort]);

  const fetchSpecimens = async (pageNumber) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNumber,
        limit: 24,
        sort: selectedSort
      });

      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedDiet !== 'All') params.append('diet', selectedDiet);
      if (selectedHabitat !== 'All') params.append('habitat', selectedHabitat);
      if (selectedEra !== 'All') params.append('era', selectedEra);

      const res = await apiClient.get(`/animals?${params.toString()}`);
      
      const payload = res.data;
      if (payload.animals) {
        setAnimals(payload.animals);
        setTotalPages(payload.totalPages || 1);
        setTotalCount(payload.total || 0);
      } else {
        setAnimals(payload);
        setTotalPages(1);
        setTotalCount(payload.length);
      }
    } catch (err) {
      console.error("Failed to load archive:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to build windowed page links: [1, '...', 4, 5, 6, '...', 48]
  const renderPaginationButtons = () => {
    const delta = 2; // how many numbers on each side of the active page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots.map((item, index) => {
      if (item === '...') {
        return (
          <span 
            key={`dots-${index}`} 
            style={{ padding: '8px 12px', color: 'var(--text-muted)', userSelect: 'none' }}
          >
            ...
          </span>
        );
      }

      const isActive = item === page;
      return (
        <button
          key={item}
          onClick={() => handlePageChange(item)}
          style={{
            minWidth: '40px',
            height: '40px',
            backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-card)',
            color: isActive ? '#ffffff' : 'var(--text-main)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontFamily: 'inherit',
            fontWeight: isActive ? '700' : '500',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {item}
        </button>
      );
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Title */}
      <header style={{ marginBottom: '35px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.8rem', letterSpacing: '1px', marginBottom: '8px' }}>Wildlife Archive</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
          The sovereign bestiary of primeval and extant biological specimens.
        </p>
      </header>

      {/* Control Console */}
      <div className="encyclopedia-box" style={{ padding: '24px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
          
          {/* Search Box with Suggestions */}
          <div ref={searchBoxRef} style={{ position: 'relative', gridColumn: 'span 2' }}>
            <input 
              type="text" 
              placeholder="Search by name (e.g., T-rex, Smilodon)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                fontSize: '0.95rem'
              }}
            />

            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '105%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.85)',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                {suggestions.map((specimen) => (
                  <div
                    key={specimen._id}
                    onClick={() => {
                      setShowSuggestions(false);
                      navigate(`/animal/${specimen._id}`);
                    }}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 33, 168, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.95rem' }}>
                        {specimen.name}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {specimen.animalClass} • {specimen.diet}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      backgroundColor: 'var(--bg-main)', 
                      padding: '3px 8px', 
                      borderRadius: '3px',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)'
                    }}>
                      {ERA_LABELS[specimen.era] || specimen.timePeriod}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort Criteria Selector */}
          <select 
            value={selectedSort} 
            onChange={(e) => setSelectedSort(e.target.value)}
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            <option value="name_asc">Sort: Name (A → Z)</option>
            <option value="name_desc">Sort: Name (Z → A)</option>
            <option value="mya_desc">Sort: Oldest Era First</option>
            <option value="mya_asc">Sort: Most Recent First</option>
            <option value="mass_desc">Sort: Heaviest Mass</option>
            <option value="mass_asc">Sort: Lightest Mass</option>
            <option value="strength_desc">Sort: Highest Strength</option>
            <option value="size_desc">Sort: Largest Size</option>
          </select>

          {/* Era Filter */}
          <select 
            value={selectedEra} 
            onChange={(e) => setSelectedEra(e.target.value)}
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Eras</option>
            <option value="0">Precambrian</option>
            <option value="1">Paleozoic</option>
            <option value="2">Mesozoic</option>
            <option value="3">Cenozoic</option>
          </select>

          {/* Diet Filter */}
          <select 
            value={selectedDiet} 
            onChange={(e) => setSelectedDiet(e.target.value)}
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Diets</option>
            <option value="Carnivore">Carnivore</option>
            <option value="Herbivore">Herbivore</option>
            <option value="Omnivore">Omnivore</option>
            <option value="Insectivore">Insectivore</option>
          </select>

          {/* Habitat Filter */}
          <select 
            value={selectedHabitat} 
            onChange={(e) => setSelectedHabitat(e.target.value)}
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Habitats</option>
            <option value="Terrestrial">Terrestrial</option>
            <option value="Marine">Marine</option>
            <option value="Freshwater">Freshwater</option>
            <option value="Aerial">Aerial</option>
          </select>

        </div>

        {/* Readout */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>
            Displaying Page <strong>{page}</strong> of <strong>{totalPages}</strong> (<strong>{totalCount}</strong> archived specimens)
          </span>
          {(searchTerm || selectedDiet !== 'All' || selectedHabitat !== 'All' || selectedEra !== 'All' || selectedSort !== 'name_asc') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedDiet('All');
                setSelectedHabitat('All');
                setSelectedEra('All');
                setSelectedSort('name_asc');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'underline'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Specimen Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Consulting the royal scrolls...
        </div>
      ) : animals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          No cataloged specimens match your criteria.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px' }}>
            {animals.map((animal) => (
              <AnimalCard key={animal._id} animal={animal} />
            ))}
          </div>

          {/* Numbered Pagination Nav */}
          {totalPages > 1 && (
            <nav 
              aria-label="Archive pagination"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '50px',
                flexWrap: 'wrap'
              }}
            >
              {/* Jump to First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-card)',
                  color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'inherit',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                « First
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-card)',
                  color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'inherit',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                ‹ Prev
              </button>

              {/* Numbered Page List */}
              {renderPaginationButtons()}

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-card)',
                  color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'inherit',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1
                }}
              >
                Next ›
              </button>

              {/* Jump to Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-card)',
                  color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'inherit',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1
                }}
              >
                Last »
              </button>
            </nav>
          )}
        </>
      )}

    </div>
  );
}

export default Home;