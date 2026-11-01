import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import AnimalCard from '../components/AnimalCard';
import StatChart from '../components/StatChart'; // Import the new chart

// Calculate Tier based on max possible score of 60
const getTier = (stats) => {
  if (!stats) return { letter: 'E', color: '#7F8C8D' };
  const total = (stats.size || 0) + (stats.speed || 0) + (stats.strength || 0) + 
                (stats.defense || 0) + (stats.aggression || 0) + (stats.intelligence || 0);
  
  if (total >= 50) return { letter: 'S', color: '#F39C12' }; // Gold
  if (total >= 40) return { letter: 'A', color: '#E74C3C' }; // Red
  if (total >= 30) return { letter: 'B', color: '#3498DB' }; // Blue
  if (total >= 20) return { letter: 'C', color: '#2ECC71' }; // Green
  if (total >= 10) return { letter: 'D', color: '#95A5A6' }; // Gray
  return { letter: 'E', color: '#7F8C8D' }; // Dark Gray
};

function AnimalDetail() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [similarAnimals, setSimilarAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const animalRes = await apiClient.get(`/animals/${id}`);
        setAnimal(animalRes.data);

        const similarRes = await apiClient.get(`/animals/${id}/similar`);
        setSimilarAnimals(similarRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading specimen data...</div>;
  if (!animal) return <div style={{ padding: '40px', textAlign: 'center' }}>Specimen not found.</div>;

  const tier = getTier(animal.stats);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500', display: 'inline-block', marginBottom: '20px' }}>
        &larr; Back to Archive
      </Link>
      
      <div className="encyclopedia-box" style={{ padding: '30px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{animal.name}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontStyle: 'italic' }}>
              {animal.animalClass} • {animal.timePeriod} ({animal.startMya} Million Years Ago)
            </p>
          </div>
          
          {/* Dynamic Tier Badge */}
          <div style={{ 
            backgroundColor: tier.color, 
            color: 'white', 
            width: '50px', 
            height: '50px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '8px',
            fontSize: '1.8rem',
            fontWeight: '900',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {tier.letter}
          </div>
        </div>

        <Link to={`/compare?ids=${animal._id},`} style={{ 
          display: 'inline-block', padding: '8px 16px', backgroundColor: 'var(--bg-main)', 
          border: '1px solid var(--border)', borderRadius: '4px', textDecoration: 'none', 
          color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '20px' 
        }}>
          Compare this Specimen
        </Link>

        {animal.imageUrl && (
          <img src={animal.imageUrl} alt={animal.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', marginTop: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '15px', borderRadius: '4px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Classification</h3>
            <p><strong>Diet:</strong> {animal.diet}</p>
            <p><strong>Habitat:</strong> {animal.habitat}</p>
            <p><strong>Era:</strong> {animal.era}</p>
            <p><strong>Estimated Mass:</strong> {animal.massKg} kg</p>
          </div>
          
          {/* Replaced Text Stats with Radar Chart */}
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '15px', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', textAlign: 'center' }}>Combat Analysis</h3>
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <StatChart stats={animal.stats} />
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>Description</h3>
        <p style={{ lineHeight: '1.8' }}>{animal.description || "No description available in the archive."}</p>
      </div>

      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Statistically Similar Specimens</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
          Calculated via K-Nearest Neighbors (KNN) algorithm based on biological base stats.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {similarAnimals.map(simAnimal => (
            <AnimalCard key={simAnimal._id} animal={simAnimal} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnimalDetail;