import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ItemDetails = () => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/items/${id}`);
        setItem(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch item details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/items/${id}`);
        navigate('/');
      } catch (err) {
        setError('Failed to delete item');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!item) {
    return <div className="not-found">Item not found</div>;
  }

  return (
    <div className="item-details">
      <h1>{item.name}</h1>
      <p className="item-description">{item.description}</p>
      <p className="item-date">
        <strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}
      </p>
      <div className="item-actions">
        <Link to={`/items/edit/${item._id}`} className="btn btn-edit">
          Edit
        </Link>
        <button onClick={handleDelete} className="btn btn-delete">
          Delete
        </button>
        <Link to="/" className="btn btn-back">
          Back to List
        </Link>
      </div>
    </div>
  );
};

export default ItemDetails;