import React, { useState } from 'react';
import axios from 'axios';
import './FilmsPage.css';

function FilmsPage({ onBackToHome }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [filmDetails, setFilmDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [rentalError, setRentalError] = useState(null);
  const [rentalSuccess, setRentalSuccess] = useState(null);

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

  const closeFilmDetails = () => {
    setSelectedFilm(null);
    setFilmDetails(null);
  };

  const openRentalModal = async (filmId) => {
    try {
      setRentalLoading(true);
      setRentalError(null);
      setRentalSuccess(null);
      
      // Fetch customers and inventory in parallel
      const [customersResponse, inventoryResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/customers'),
        axios.get(`http://localhost:5000/api/film/${filmId}/inventory`)
      ]);
      
      setCustomers(customersResponse.data);
      console.log('Inventory data:', inventoryResponse.data);
      const availableInventory = inventoryResponse.data.filter(item => item.status === 'Available');
      console.log('Available inventory:', availableInventory);
      setInventory(availableInventory);
      setShowRentalModal(true);
      setSelectedFilm(filmId);
    } catch (err) {
      setRentalError('Failed to load rental information');
      console.error('Error opening rental modal:', err);
    } finally {
      setRentalLoading(false);
    }
  };

  const closeRentalModal = () => {
    setShowRentalModal(false);
    setSelectedFilm(null);
    setCustomers([]);
    setInventory([]);
    setRentalError(null);
    setRentalSuccess(null);
  };

  const handleRental = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customerId = formData.get('customer');
    const inventoryId = formData.get('inventory');
    
    if (!customerId || !inventoryId) {
      setRentalError('Please select both customer and inventory');
      return;
    }
    
    try {
      setRentalLoading(true);
      setRentalError(null);
      
      const response = await axios.post('http://localhost:5000/api/rentals', {
        customer_id: customerId,
        inventory_id: inventoryId,
        staff_id: 1 // Default staff ID - in a real app this would come from authentication
      });
      
      setRentalSuccess(response.data.message);
      
      // Refresh inventory to update availability
      const inventoryResponse = await axios.get(`http://localhost:5000/api/film/${selectedFilm}/inventory`);
      setInventory(inventoryResponse.data.filter(item => item.status === 'Available'));
      
    } catch (err) {
      setRentalError(err.response?.data?.error || 'Failed to create rental');
      console.error('Error creating rental:', err);
    } finally {
      setRentalLoading(false);
    }
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
              <div 
                key={film.film_id} 
                className="film-card clickable"
                onClick={() => fetchFilmDetails(film.film_id)}
              >
                <h3 className="film-title">{film.title}</h3>
                <p className="film-year">({film.release_year})</p>
                <p className="film-rating">Rating: {film.rating}</p>
                <p className="film-rental-rate">Rental Rate: ${film.rental_rate}</p>
                <p className="film-rental-count">Rented {film.rental_count} times</p>
                <p className="film-description">{film.description}</p>
                <div className="film-actions">
                  <div className="click-hint">Click for details</div>
                  <button 
                    className="rent-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openRentalModal(film.film_id);
                    }}
                  >
                    Rent Film
                  </button>
                </div>
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

      {/* Film Details Modal */}
      {selectedFilm && (
        <div className="modal-overlay" onClick={closeFilmDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
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

      {/* Rental Modal */}
      {showRentalModal && (
        <div className="modal-overlay" onClick={closeRentalModal}>
          <div className="modal-content rental-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeRentalModal}>×</button>
            
            <h2 className="rental-title">Rent Film</h2>
            
            {rentalLoading && !rentalSuccess ? (
              <div className="loading">Loading rental information...</div>
            ) : (
              <form onSubmit={handleRental} className="rental-form">
                <div className="form-group">
                  <label htmlFor="customer">Select Customer:</label>
                  <select id="customer" name="customer" required>
                    <option value="">Choose a customer...</option>
                    {customers.map(customer => (
                      <option key={customer.customer_id} value={customer.customer_id}>
                        {customer.first_name} {customer.last_name} ({customer.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="inventory">Select Available Copy:</label>
                  <select id="inventory" name="inventory" required>
                    <option value="">Choose available copy...</option>
                    {inventory.map(item => (
                      <option key={item.inventory_id} value={item.inventory_id}>
                        Store {item.store_id} - Copy {item.inventory_id}
                      </option>
                    ))}
                  </select>
                </div>
                
                {inventory.length === 0 && (
                  <div className="no-inventory">
                    <p>No copies available for rental at this time.</p>
                  </div>
                )}
                
                {rentalError && (
                  <div className="error-message">
                    {rentalError}
                  </div>
                )}
                
                {rentalSuccess && (
                  <div className="success-message">
                    {rentalSuccess}
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={closeRentalModal}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="confirm-rent-button"
                    disabled={rentalLoading || inventory.length === 0}
                  >
                    {rentalLoading ? 'Processing...' : 'Confirm Rental'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilmsPage;
