import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ItemForm from "../components/events/ItemForm";

const AddItem = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await axios.post("http://localhost:5000/api/items", formData);
      navigate("/");
    } catch (err) {
      setError("Failed to add item");
      console.error(err);
    }
  };

  return (
    <div className="add-item-page">
      <h1>Add New Item</h1>
      {error && <div className="error">{error}</div>}
      <ItemForm onSubmit={handleSubmit} buttonText="Add Item" />
    </div>
  );
};

export default AddItem;
