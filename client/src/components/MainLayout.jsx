import React, { useContext } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AIChatbot from './AIChatbot';
import { AuthContext } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content fade-up pt-24 pb-20" style={{ minHeight: 'calc(100vh - 12rem)' }}>
        {children}
      </main>
      <Footer />
      
      {/* AI Chatbot - Only show for logged-in users */}
      {user && <AIChatbot />}
    </div>
  );
};

export default MainLayout;
