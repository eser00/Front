import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomersPage.css';

const CustomersPage = ({ onBackToHome }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });

  const fetchCustomers = async (page = 1, search = '', type = 'name') => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:5000/api/customers?page=${page}&limit=10`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}&type=${type}`;
      }
      
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      console.log('Customers:', response.data.customers);
      console.log('Pagination:', response.data.pagination);
      setCustomers(response.data.customers);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCustomers(newPage, searchQuery, searchType);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(1, searchQuery, searchType);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchType('name');
    fetchCustomers(1);
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setAddError(null);
    setAddSuccess(null);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddError(null);
    setAddSuccess(null);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customerData = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      store_id: parseInt(formData.get('store_id'))
    };

    if (!customerData.first_name || !customerData.last_name || !customerData.email) {
      setAddError('Please fill in all required fields');
      return;
    }

    try {
      setAddLoading(true);
      setAddError(null);
      
      const response = await axios.post('http://localhost:5000/api/customers', customerData);
      
      setAddSuccess('Customer added successfully!');
      
      // Refresh the customers list
      setTimeout(() => {
        fetchCustomers(1, searchQuery, searchType);
        closeAddModal();
      }, 1500);
      
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add customer');
      console.error('Error adding customer:', err);
    } finally {
      setAddLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  console.log('Current customers state:', customers);
  console.log('Current pagination state:', pagination);
  console.log('Loading state:', loading);
  console.log('Error state:', error);

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customers-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="customers-header">
        <button className="back-button" onClick={onBackToHome}>← Back to Home</button>
        <h1 className="customers-title">Customer Management</h1>
        <p className="customers-subtitle">Manage your store's customers</p>
      </div>

      <div className="customers-content">
        {pagination && (
          <div className="customers-stats">
            <div className="stat-card">
              <h3>Total Customers</h3>
              <p className="stat-number">{pagination.totalCustomers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Current Page</h3>
              <p className="stat-number">{pagination.currentPage || 1} of {pagination.totalPages || 1}</p>
            </div>
          </div>
        )}

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-controls">
              <select 
                value={searchType} 
                onChange={(e) => setSearchType(e.target.value)}
                className="search-type-select"
              >
                <option value="name">Search by Name</option>
                <option value="id">Search by Customer ID</option>
                <option value="first_name">Search by First Name</option>
                <option value="last_name">Search by Last Name</option>
              </select>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Enter ${searchType === 'name' ? 'customer name' : searchType === 'id' ? 'customer ID' : searchType === 'first_name' ? 'first name' : 'last name'}...`}
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
          
          <div className="add-customer-section">
            <button onClick={openAddModal} className="add-customer-button">
              + Add New Customer
            </button>
          </div>
        </div>

        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Store</th>
                <th>Member Since</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers && customers.map((customer) => (
                <tr key={customer.customer_id}>
                  <td className="customer-id">#{customer.customer_id}</td>
                  <td className="customer-name">
                    {customer.first_name} {customer.last_name}
                  </td>
                  <td className="customer-email">{customer.email}</td>
                  <td className="customer-store">Store {customer.store_id}</td>
                  <td className="customer-date">{formatDate(customer.create_date)}</td>
                  <td className="customer-status">
                    <span className={`status-badge ${customer.active ? 'active' : 'inactive'}`}>
                      {customer.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange((pagination.currentPage || 1) - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
            </div>
            
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange((pagination.currentPage || 1) + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </button>
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={closeAddModal}>
            <div className="modal-content add-customer-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={closeAddModal}>×</button>
              
              <h2 className="modal-title">Add New Customer</h2>
              
              {addLoading && !addSuccess ? (
                <div className="loading">Adding customer...</div>
              ) : (
                <form onSubmit={handleAddCustomer} className="add-customer-form">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name *</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      required
                      className="form-input"
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name *</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      required
                      className="form-input"
                      placeholder="Enter last name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="form-input"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="store_id">Store</label>
                    <select id="store_id" name="store_id" className="form-select" defaultValue="1">
                      <option value="1">Store 1</option>
                      <option value="2">Store 2</option>
                    </select>
                  </div>
                  
                  {addError && (
                    <div className="error-message">
                      {addError}
                    </div>
                  )}
                  
                  {addSuccess && (
                    <div className="success-message">
                      {addSuccess}
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={closeAddModal}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="confirm-button"
                      disabled={addLoading}
                    >
                      {addLoading ? 'Adding...' : 'Add Customer'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
