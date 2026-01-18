import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// ✅ Use ONLY deployed backend URL via Vite env
const API_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [barcode, setBarcode] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/analyze-food`, {
        barcode: barcode.trim() || undefined,
        ingredients: ingredients.trim() || undefined,
      });

      if (response.data.requires_clarification) {
        setResult({
          clarification: true,
          message: response.data.clarification_message,
        });
      } else {
        setResult({
          clarification: false,
          product_name: response.data.product_name,
          safety_status: response.data.safety_status,
          harmful_ingredients: response.data.harmful_ingredients,
          explanation: response.data.explanation,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'An error occurred while analyzing food'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SAFE':
        return '#10b981';
      case 'CAUTION':
        return '#f59e0b';
      case 'UNSAFE':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'SAFE':
        return '#d1fae5';
      case 'CAUTION':
        return '#fef3c7';
      case 'UNSAFE':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🍎 Food Awareness System</h1>
          <p>Analyze food safety by barcode or ingredients</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="barcode">Barcode Number (Optional)</label>
            <input
              id="barcode"
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g., 3017620422003"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ingredients">Ingredients List</label>
            <textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Enter ingredients separated by commas"
              rows="5"
              className="textarea"
              required={!barcode}
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!barcode && !ingredients.trim())}
            className="button"
          >
            {loading ? 'Analyzing...' : 'Check Food Safety'}
          </button>
        </form>

        {error && (
          <div className="result error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result">
            {result.clarification ? (
              <div className="clarification">
                <h3>⚠️ Clarification Needed</h3>
                <p>{result.message}</p>
              </div>
            ) : (
              <>
                {result.product_name && (
                  <div className="product-name">
                    <h2>{result.product_name}</h2>
                  </div>
                )}

                <div
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusBgColor(result.safety_status),
                    color: getStatusColor(result.safety_status),
                    borderColor: getStatusColor(result.safety_status),
                  }}
                >
                  <strong>
                    {result.safety_status === 'SAFE' && '✓ SAFE'}
                    {result.safety_status === 'CAUTION' && '⚠ CONSUME WITH CAUTION'}
                    {result.safety_status === 'UNSAFE' && '✗ UNSAFE'}
                  </strong>
                </div>

                <div className="explanation">
                  <p>{result.explanation}</p>
                </div>

                {result.harmful_ingredients?.length > 0 && (
                  <div className="harmful-ingredients">
                    <h4>Harmful Ingredients Detected:</h4>
                    <ul>
                      {result.harmful_ingredients.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
