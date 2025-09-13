import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [topFilms, setTopFilms] = useState([]);
  const [topActors, setTopActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actorsLoading, setActorsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [filmDetails, setFilmDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchTopRentedFilms();
    fetchTopActors();
  }, []);

  const fetchTopRentedFilms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/top-rented-films');
      setTopFilms(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch top rented films');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilmDetails = async (filmId) => {
    try {
      setDetailsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/film/${filmId}`);
      setFilmDetails(response.data);
      setSelectedFilm(filmId);
    } catch (err) {
      console.error('Error fetching film details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchTopActors = async () => {
    try {
      setActorsLoading(true);
      const response = await axios.get('http://localhost:5000/api/top-actors');
      setTopActors(response.data);
    } catch (err) {
      console.error('Error fetching top actors:', err);
    } finally {
      setActorsLoading(false);
    }
  };

  const closeFilmDetails = () => {
    setSelectedFilm(null);
    setFilmDetails(null);
  };

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Film Rental Store</h1>
          <p>Loading top rented films...</p>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Film Rental Store</h1>
          <p className="error">{error}</p>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Film Rental Store</h1>
        <h2>Top 5 Most Rented Films of All Time</h2>
      </header>
      
      <main className="main-content">
        <div className="films-grid">
          {topFilms.map((film, index) => (
            <div 
              key={film.film_id} 
              className="film-card clickable"
              onClick={() => fetchFilmDetails(film.film_id)}
            >
              <div className="film-rank">#{index + 1}</div>
              <h3 className="film-title">{film.title}</h3>
              <p className="film-year">({film.release_year})</p>
              <p className="film-rating">Rating: {film.rating}</p>
              <p className="film-rental-rate">Rental Rate: ${film.rental_rate}</p>
              <p className="film-rental-count">Rented {film.rental_count} times</p>
              <p className="film-description">{film.description}</p>
              <div className="click-hint">Click for details</div>
            </div>
          ))}
        </div>

        {/* Top Actors Section */}
        <div className="actors-section">
          <h2>Top 5 Actors from Store Films</h2>
          {actorsLoading ? (
            <p className="loading-text">Loading top actors...</p>
          ) : (
            <div className="actors-grid">
              {topActors.map((actor, index) => (
                <div key={actor.actor_id} className="actor-card">
                  <div className="actor-rank">#{index + 1}</div>
                  <h3 className="actor-name">{actor.first_name} {actor.last_name}</h3>
                  <p className="actor-films">Films in Store: {actor.film_count}</p>
                  <p className="actor-rentals">Total Rentals: {actor.total_rentals}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Film Details Modal */}
      {selectedFilm && (
        <div className="modal-overlay" onClick={closeFilmDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeFilmDetails}>×</button>
            
            {detailsLoading ? (
              <div className="loading">Loading film details...</div>
            ) : filmDetails ? (
              <div className="film-details">
                <h2 className="film-details-title">{filmDetails.title}</h2>
                <div className="film-details-grid">
                  <div className="film-details-section">
                    <h3>Basic Information</h3>
                    <p><strong>Year:</strong> {filmDetails.release_year}</p>
                    <p><strong>Rating:</strong> {filmDetails.rating}</p>
                    <p><strong>Language:</strong> {filmDetails.language}</p>
                    <p><strong>Length:</strong> {filmDetails.length} minutes</p>
                    <p><strong>Categories:</strong> {filmDetails.categories}</p>
                  </div>
                  
                  <div className="film-details-section">
                    <h3>Rental Information</h3>
                    <p><strong>Rental Rate:</strong> ${filmDetails.rental_rate}</p>
                    <p><strong>Rental Duration:</strong> {filmDetails.rental_duration} days</p>
                    <p><strong>Replacement Cost:</strong> ${filmDetails.replacement_cost}</p>
                    <p><strong>Total Rentals:</strong> {filmDetails.rental_count}</p>
                    <p><strong>Total Copies:</strong> {filmDetails.total_copies}</p>
                    <p><strong>Currently Rented:</strong> {filmDetails.currently_rented}</p>
                  </div>
                  
                  <div className="film-details-section full-width">
                    <h3>Cast</h3>
                    <p>{filmDetails.actors}</p>
                  </div>
                  
                  <div className="film-details-section full-width">
                    <h3>Description</h3>
                    <p>{filmDetails.description}</p>
                  </div>
                  
                  {filmDetails.special_features && (
                    <div className="film-details-section full-width">
                      <h3>Special Features</h3>
                      <p>{filmDetails.special_features}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="error">Failed to load film details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
