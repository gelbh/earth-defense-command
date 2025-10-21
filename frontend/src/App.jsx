import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ExoplanetList from './components/ExoplanetList';
import ErrorMessage from './components/ErrorMessage';
import { exoplanetAPI } from './services/api';
import './App.css';

function App() {
  const [planets, setPlanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 50,
    total: 0,
    hasMore: false
  });

  const fetchExoplanets = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPlanets([]);
        setPagination(prev => ({ ...prev, offset: 0 }));
      } else {
        setLoadingMore(true);
      }

      setError(null);

      const offset = reset ? 0 : pagination.offset;
      const data = await exoplanetAPI.getAllExoplanets({
        limit: pagination.limit,
        offset
      });

      setPlanets(prev => reset ? data.data : [...prev, ...data.data]);
      setPagination({
        offset: offset + data.count,
        limit: data.limit,
        total: data.total,
        hasMore: data.hasMore
      });
      setIsSearching(false);
      setSearchTerm('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = async (term, reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPlanets([]);
        setPagination(prev => ({ ...prev, offset: 0 }));
      } else {
        setLoadingMore(true);
      }

      setError(null);
      setIsSearching(true);
      setSearchTerm(term);

      const offset = reset ? 0 : pagination.offset;
      const data = await exoplanetAPI.searchExoplanets(term, {
        limit: pagination.limit,
        offset
      });

      setPlanets(prev => reset ? data.data : [...prev, ...data.data]);
      setPagination({
        offset: offset + data.count,
        limit: data.limit,
        total: data.total,
        hasMore: data.hasMore
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (isSearching && searchTerm) {
      handleSearch(searchTerm, false);
    } else {
      fetchExoplanets(false);
    }
  };

  const handleClear = () => {
    fetchExoplanets(true);
  };

  useEffect(() => {
    fetchExoplanets(true);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Exoplanet Explorer</h1>
        <p>Discover the universe beyond our solar system</p>
      </header>

      <main className="App-main">
        <SearchBar onSearch={(term) => handleSearch(term, true)} onClear={handleClear} />

        {error ? (
          <ErrorMessage message={error} onRetry={isSearching ? handleClear : fetchExoplanets} />
        ) : (
          <ExoplanetList
            planets={planets}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={pagination.hasMore}
            total={pagination.total}
            onLoadMore={handleLoadMore}
          />
        )}
      </main>
    </div>
  );
}

export default App;
