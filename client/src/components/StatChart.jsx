import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

function StatChart({ stats, label = 'Combat Potential' }) {
  const statKeys = ['size', 'speed', 'strength', 'defense', 'aggression', 'intelligence'];
  const values = statKeys.map((k) => (stats && stats[k] !== undefined ? stats[k] : 5));

  const data = {
    labels: ['Size', 'Speed', 'Strength', 'Defense', 'Aggression', 'Intelligence'],
    datasets: [
      {
        label: label,
        data: values,
        // The Spider-Web Fill & Outline (Monarch Purple with Glow)
        backgroundColor: 'rgba(168, 85, 247, 0.35)',
        borderColor: '#a855f7',
        borderWidth: 2.5,
        pointBackgroundColor: '#cfb53b', // Tarnished gold points
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 4.5,
        pointHoverRadius: 6.5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#d4c8b8',
        bodyColor: '#ffffff',
        borderColor: '#2a2824',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          display: true,
          color: 'rgba(212, 200, 184, 0.45)', // Visible tick labels (2, 4, 6, 8, 10)
          backdropColor: 'transparent',
          font: { size: 10, family: 'Georgia' }
        },
        // The Spider Web Concentric Polygon Rings
        grid: {
          color: 'rgba(212, 200, 184, 0.22)', // Crisp, visible web rings
          lineWidth: 1.2
        },
        // The Radial Spokes from center to vertices
        angleLines: {
          color: 'rgba(212, 200, 184, 0.3)', // Distinct radial spokes
          lineWidth: 1.5
        },
        // The 6 Metric Text Labels
        pointLabels: {
          color: '#d4c8b8', // Parchment ivory
          font: {
            size: 12,
            weight: '600',
            family: 'Georgia, serif'
          }
        }
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '320px', position: 'relative' }}>
      <Radar data={data} options={options} />
    </div>
  );
}

export default StatChart;