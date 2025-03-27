import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>Copyright &copy; {new Date().getFullYear()} MERN App</p>
      </div>
    </footer>
  );
};

export default Footer;