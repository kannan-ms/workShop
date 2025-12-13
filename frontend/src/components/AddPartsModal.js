import React, { useState, useEffect } from 'react';
import { jobCardsAPI, inventoryAPI } from '../services/api';

function AddPartsModal({ jobCardId, onClose, onSuccess }) {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 1
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchInventory();
    } else {
      loadInventory();
    }
  }, [searchQuery]);

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
    } catch (err) {
      setError('Failed to load inventory');
    } finally {
      setLoadingInventory(false);
    }
  };

  const searchInventory = async () => {
    try {
      const response = await inventoryAPI.search(searchQuery);
      setInventory(response.data);
    } catch (err) {
      setError('Failed to search inventory');
    }
  };

  const handlePartSelect = (part) => {
    setSelectedPart(part);
    setFormData({ quantity: 1 });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPart) {
      setError('Please select a part');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await jobCardsAPI.addParts(jobCardId, {
        inventoryCode: selectedPart.code,
        name: selectedPart.name,
        quantity: parseInt(formData.quantity),
        unitPrice: selectedPart.price
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add part');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Add Parts</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        
        <div className="form-group">
          <label>Search Inventory</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code..."
          />
        </div>

        {loadingInventory ? (
          <div>Loading inventory...</div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
            {inventory.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No inventory items found
              </div>
            ) : (
              inventory.map(part => (
                <div
                  key={part.code}
                  onClick={() => handlePartSelect(part)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: selectedPart?.code === part.code ? '#e3f2fd' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <strong>{part.name}</strong> ({part.code})
                  <br />
                  <small>Price: ₹{part.price} | Stock: {part.stock}</small>
                </div>
              ))
            )}
          </div>
        )}

        {selectedPart && (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: '15px', backgroundColor: '#f8f9fa' }}>
              <p><strong>Selected:</strong> {selectedPart.name}</p>
              <p><strong>Code:</strong> {selectedPart.code}</p>
              <p><strong>Price:</strong> ₹{selectedPart.price}</p>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max={selectedPart.stock}
                required
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                Available stock: {selectedPart.stock}
              </small>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Part'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddPartsModal;

