import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobCardsAPI, inventoryAPI } from '../services/api';
import AddUpdateModal from '../components/AddUpdateModal';
import AddPartsModal from '../components/AddPartsModal';

function JobCardDetail({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobCard, setJobCard] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobCard();
  }, [id]);

  const loadJobCard = async () => {
    try {
      const response = await jobCardsAPI.getById(id);
      setJobCard(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job card');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdded = () => {
    setShowUpdateModal(false);
    loadJobCard();
  };

  const handlePartsAdded = () => {
    setShowPartsModal(false);
    loadJobCard();
  };

  const handleGenerateBill = async () => {
    try {
      const response = await jobCardsAPI.getBill(id);
      setBill(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate bill');
    }
  };

  const handleAuthorize = async () => {
    try {
      await jobCardsAPI.updateStatus(id, 'in_progress');
      loadJobCard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authorize');
    }
  };

  const canAddUpdate = ['technician', 'manager'].includes(user.role);
  const canAddParts = ['cashier', 'manager'].includes(user.role);
  const canAuthorize = user.role === 'manager';

  if (loading) {
    return (
      <div className="App">
        
        <div className="container">Loading...</div>
      </div>
    );
  }

  if (!jobCard) {
    return (
      <div className="App">
        
        <div className="container">
          <div className="alert alert-error">{error || 'Job card not found'}</div>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      

      <div className="container">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px' }}>
          ← Back to Dashboard
        </button>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <h2>Job Card Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '15px' }}>
            <div>
              <strong>Customer Name:</strong> {jobCard.customerName}
            </div>
            <div>
              <strong>Vehicle Number:</strong> {jobCard.vehicleNo}
            </div>
            <div>
              <strong>Vehicle Type:</strong> 
              <span className={`badge badge-${jobCard.vehicleType.toLowerCase()}`} style={{ marginLeft: '10px' }}>
                {jobCard.vehicleType}
              </span>
            </div>
            <div>
              <strong>Status:</strong> 
              <span style={{ 
                marginLeft: '10px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: jobCard.status === 'done' ? '#d4edda' : 
                                jobCard.status === 'waiting_auth' ? '#fff3cd' : '#e3f2fd',
                color: jobCard.status === 'done' ? '#155724' : 
                       jobCard.status === 'waiting_auth' ? '#856404' : '#1976d2',
                textTransform: 'capitalize'
              }}>
                {jobCard.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <strong>Created:</strong> {new Date(jobCard.createdAt).toLocaleString()}
            </div>
            {jobCard.createdBy && (
              <div>
                <strong>Created By:</strong> {jobCard.createdBy.username} ({jobCard.createdBy.role})
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h3>Actions</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
            {canAddUpdate && (
              <button className="btn btn-primary" onClick={() => setShowUpdateModal(true)}>
                Add Update
              </button>
            )}
            {canAddParts && (
              <button className="btn btn-primary" onClick={() => setShowPartsModal(true)}>
                Add Parts
              </button>
            )}
            {canAuthorize && jobCard.status === 'waiting_auth' && (
              <button className="btn btn-primary" onClick={handleAuthorize}>
                Authorize (Set to In Progress)
              </button>
            )}
            <button className="btn btn-primary" onClick={handleGenerateBill}>
              Generate Bill
            </button>
          </div>
        </div>

        {/* Updates */}
        {jobCard.updates && jobCard.updates.length > 0 && (
          <div className="card">
            <h3>Updates</h3>
            <div className="updates-list">
              {jobCard.updates.map((update, index) => (
                <div key={index} className={`update-item ${update.criticalIssue ? 'critical' : ''}`}>
                  <p><strong>Status:</strong> {update.status.replace('_', ' ')}</p>
                  <p><strong>Note:</strong> {update.note}</p>
                  {update.criticalIssue && (
                    <p><span className="badge badge-critical">Critical Issue</span></p>
                  )}
                  <div className="update-meta">
                    {update.updatedBy && (
                      <span>By: {update.updatedBy.username} ({update.updatedBy.role})</span>
                    )}
                    <span style={{ marginLeft: '15px' }}>
                      {new Date(update.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parts */}
        {jobCard.parts && jobCard.parts.length > 0 && (
          <div className="card">
            <h3>Parts Added</h3>
            <div className="parts-list">
              {jobCard.parts.map((part, index) => (
                <div key={index} className="part-item">
                  <div>
                    <strong>{part.name}</strong> ({part.inventoryCode})
                    <br />
                    <small>Qty: {part.quantity} × ₹{part.unitPrice}</small>
                  </div>
                  <div>
                    <strong>₹{(part.quantity * part.unitPrice).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bill */}
        {bill && (
          <div className="card">
            <h3>Bill</h3>
            <div className="bill-section">
              <div className="bill-row">
                <span>Parts Total:</span>
                <span>₹{bill.partsTotal.toFixed(2)}</span>
              </div>
              <div className="bill-row">
                <span>Labour Charge:</span>
                <span>₹{bill.labourCharge.toFixed(2)}</span>
              </div>
              <div className="bill-row">
                <span>Subtotal:</span>
                <span>₹{bill.subtotal.toFixed(2)}</span>
              </div>
              <div className="bill-row">
                <span>GST (18%):</span>
                <span>₹{bill.gst.toFixed(2)}</span>
              </div>
              <div className="bill-row total">
                <span>Total:</span>
                <span>₹{bill.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showUpdateModal && (
        <AddUpdateModal
          jobCardId={id}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateAdded}
        />
      )}

      {showPartsModal && (
        <AddPartsModal
          jobCardId={id}
          onClose={() => setShowPartsModal(false)}
          onSuccess={handlePartsAdded}
        />
      )}
    </div>
  );
}

export default JobCardDetail;

