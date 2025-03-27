import React from 'react';
import ItemList from '../components/items/ItemList';

const Home = () => {
  return (
    <div className="home-page">
      <h1>Welcome to MERN App</h1>
      <ItemList />
    </div>
  );
};

export default Home;