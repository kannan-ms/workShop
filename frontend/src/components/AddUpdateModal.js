import React, { useState } from 'react';
import { jobCardsAPI } from '../services/api';

function AddUpdateModal({ jobCardId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    status: 'in_progress',
    note: '',
    criticalIssue: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await jobCardsAPI.addUpdate(jobCardId, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Update</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Note: If Critical Issue is checked, status will automatically become "Waiting Auth"
            </small>
          </div>
          <div className="form-group">
            <label>Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              required
              placeholder="Enter update note..."
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="criticalIssue"
                checked={formData.criticalIssue}
                onChange={handleChange}
                style={{ width: 'auto', marginRight: '8px' }}
              />
              Critical Issue (requires authorization)
            </label>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Update'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUpdateModal;

