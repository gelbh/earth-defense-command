import React from 'react';
import { formatDistance, formatRadius, formatMass, getPlanetSizeCategory } from '../utils/formatters';
import './ExoplanetCard.css';

const ExoplanetCard = ({ planet }) => {
  const sizeCategory = getPlanetSizeCategory(planet.pl_rade);

  return (
    <div className="exoplanet-card">
      <div className="card-header">
        <h3 className="planet-name">{planet.pl_name}</h3>
        <span className={`size-badge ${sizeCategory.toLowerCase().replace('-', '')}`}>
          {sizeCategory}
        </span>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="label">Host Star:</span>
          <span className="value">{planet.hostname || 'Unknown'}</span>
        </div>

        <div className="info-row">
          <span className="label">Discovery:</span>
          <span className="value">{planet.disc_year || 'Unknown'}</span>
        </div>

        <div className="info-row">
          <span className="label">Method:</span>
          <span className="value">{planet.discoverymethod || 'Unknown'}</span>
        </div>

        <div className="info-row">
          <span className="label">Distance:</span>
          <span className="value">{formatDistance(planet.sy_dist)}</span>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="metric-label">Radius</span>
            <span className="metric-value">{formatRadius(planet.pl_rade)}</span>
          </div>
          <div className="info-item">
            <span className="metric-label">Mass</span>
            <span className="metric-value">{formatMass(planet.pl_bmasse)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExoplanetCard;
