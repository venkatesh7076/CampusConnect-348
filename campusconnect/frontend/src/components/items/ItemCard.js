import React from 'react';
import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
  return (
    <div className="item-card">
      <h3>{item.name}</h3>
      <p>{item.description && item.description.length > 100 
          ? `${item.description.substring(0, 100)}...` 
          : item.description}</p>
      <div className="item-card-actions">
        <Link to={`/items/${item._id}`} className="btn btn-view">
          View Details
        </Link>
        <Link to={`/items/edit/${item._id}`} className="btn btn-edit">
          Edit
        </Link>
      </div>
      <div className="item-card-date">
        <small>Created: {new Date(item.createdAt).toLocaleDateString()}</small>
      </div>
    </div>
  );
};

export default ItemCard;