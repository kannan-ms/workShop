import React from 'react';
import { useLocation } from 'react-router-dom';

function Header({ user, onLogout }) {
  const location = useLocation();
  const authPaths = ['/login', '/register'];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <>
      <div className={`header ${isAuthPage ? 'auth-header' : ''}`}>
        <div className="app-brand">
          <img src="/images/ws2.avif" alt="autoServe" className="app-logo" />
          <h1 className="app-name">autoServe</h1>
        </div>

        {!isAuthPage && user && (
          <div className="header-info">
            <span>Role: <strong>{user.role.replace('_', ' ')}</strong></span>
            <span>User: <strong>{user.username}</strong></span>
            <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>

      {/* auth header is an overlay and does not allocate layout space */}
    </>
  );
}

export default Header;
