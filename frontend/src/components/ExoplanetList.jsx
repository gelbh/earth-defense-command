import React from 'react';
import ExoplanetCard from './ExoplanetCard';
import './ExoplanetList.css';

const ExoplanetList = ({ planets, loading, loadingMore, hasMore, total = 0, onLoadMore }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading exoplanets...</p>
      </div>
    );
  }

  if (!planets || planets.length === 0) {
    return (
      <div className="empty-state">
        <p>No exoplanets found</p>
      </div>
    );
  }

  return (
    <div className="exoplanet-list">
      <div className="results-info">
        <p>
          Showing {planets.length.toLocaleString()} of {(total || 0).toLocaleString()} exoplanets
        </p>
      </div>
      <div className="exoplanet-grid">
        {planets.map((planet, index) => (
          <ExoplanetCard key={`${planet.pl_name}-${index}`} planet={planet} />
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="load-more-button"
          >
            {loadingMore ? (
              <>
                <div className="button-spinner"></div>
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExoplanetList;
