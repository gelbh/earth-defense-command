import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ExoplanetList from './components/ExoplanetList';
import ErrorMessage from './components/ErrorMessage';
import { exoplanetAPI } from './services/api';
import './App.css';

function App() {
  const [planets, setPlanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchExoplanets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exoplanetAPI.getAllExoplanets();
      setPlanets(data.data || []);
      setIsSearching(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      setIsSearching(true);
      const data = await exoplanetAPI.searchExoplanets(searchTerm);
      setPlanets(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    fetchExoplanets();
  };

  useEffect(() => {
    fetchExoplanets();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Exoplanet Explorer</h1>
        <p>Discover the universe beyond our solar system</p>
      </header>

      <main className="App-main">
        <SearchBar onSearch={handleSearch} onClear={handleClear} />

        {error ? (
          <ErrorMessage message={error} onRetry={isSearching ? handleClear : fetchExoplanets} />
        ) : (
          <ExoplanetList planets={planets} loading={loading} />
        )}
      </main>
    </div>
  );
}

export default App;
