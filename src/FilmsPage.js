import React, { useState } from 'react';
import axios from 'axios';
import './FilmsPage.css';

function FilmsPage({ onBackToHome }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/search-films`, {
        params: {
          query: searchQuery.trim(),
          type: searchType
        }
      });
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to search films');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  return (
    <div className="films-page">
      <header className="films-header">
        <button className="back-button" onClick={onBackToHome}>← Back to Home</button>
        <h1>Film Search</h1>
        <p>Search films by title, actor name, or genre</p>
      </header>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              className="search-type-select"
            >
              <option value="title">Search by Film Title</option>
              <option value="actor">Search by Actor Name</option>
              <option value="genre">Search by Genre</option>
            </select>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Enter ${searchType === 'title' ? 'film title' : searchType === 'actor' ? 'actor name' : 'genre'}...`}
              className="search-input"
            />
            
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            
            <button type="button" onClick={clearSearch} className="clear-button">
              Clear
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h2>Search Results ({searchResults.length} found)</h2>
          <div className="films-grid">
            {searchResults.map((film) => (
              <div key={film.film_id} className="film-card">
                <h3 className="film-title">{film.title}</h3>
                <p className="film-year">({film.release_year})</p>
                <p className="film-rating">Rating: {film.rating}</p>
                <p className="film-rental-rate">Rental Rate: ${film.rental_rate}</p>
                <p className="film-rental-count">Rented {film.rental_count} times</p>
                <p className="film-description">{film.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && !loading && searchQuery && (
        <div className="no-results">
          <p>No films found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default FilmsPage;
