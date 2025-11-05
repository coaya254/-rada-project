import React from 'react';

export default function ProtectedRoute({ children, isAllowed }) {
  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <h1 className="text-3xl font-black mb-4">🔒 Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return children;
}