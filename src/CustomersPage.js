import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomersPage.css';

const CustomersPage = ({ onBackToHome }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/customers?page=${page}&limit=10`);
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
      fetchCustomers(newPage);
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
      </div>
    </div>
  );
};

export default CustomersPage;
