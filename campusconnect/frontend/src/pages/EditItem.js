import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ItemForm from "../components/events/ItemForm";

const EditItem = () => {
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
        setError("Failed to fetch item");
        setLoading(false);
        console.error(err);
      }
    };

    fetchItem();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await axios.put(`http://localhost:5000/api/items/${id}`, formData);
      navigate(`/items/${id}`);
    } catch (err) {
      setError("Failed to update item");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="edit-item-page">
      <h1>Edit Item</h1>
      <ItemForm item={item} onSubmit={handleSubmit} buttonText="Update Item" />
    </div>
  );
};

export default EditItem;
