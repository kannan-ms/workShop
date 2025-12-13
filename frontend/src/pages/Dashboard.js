import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kanbanAPI, jobCardsAPI } from '../services/api';
import CreateJobCardModal from '../components/CreateJobCardModal';

function Dashboard({ user, onLogout }) {
  const [kanbanData, setKanbanData] = useState({
    new: [],
    in_progress: [],
    waiting_auth: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadKanban();
  }, []);

  const loadKanban = async () => {
    try {
      const response = await kanbanAPI.getKanban();
      setKanbanData(response.data);
    } catch (err) {
      console.error('Error loading kanban:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (cardId) => {
    navigate(`/jobcard/${cardId}`);
  };

  const handleJobCardCreated = () => {
    setShowCreateModal(false);
    loadKanban();
  };

  const canCreateJobCard = ['service_advisor', 'manager'].includes(user.role);

  return (
    <div className="App">
      

      <div className="container">
        {canCreateJobCard && (
          <div style={{ marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Job Card
            </button>
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="kanban-board">
            {Object.entries(kanbanData).map(([status, cards]) => (
              <div key={status} className="kanban-column">
                <h3>{status.replace('_', ' ')} ({cards.length})</h3>
                {cards.map(card => (
                  <div
                    key={card._id}
                    className="kanban-card"
                    onClick={() => handleCardClick(card._id)}
                  >
                    <h4>{card.customerName}</h4>
                    <p><strong>Vehicle:</strong> {card.vehicleNo}</p>
                    <p>
                      <span className={`badge badge-${card.vehicleType.toLowerCase()}`}>
                        {card.vehicleType}
                      </span>
                    </p>
                    {card.updates && card.updates.length > 0 && (
                      <p style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
                        Last update: {new Date(card.updates[card.updates.length - 1].createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateJobCardModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleJobCardCreated}
        />
      )}
    </div>
  );
}

export default Dashboard;

