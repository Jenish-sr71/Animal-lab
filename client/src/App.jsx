import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AnimalDetail from './pages/AnimalDetail';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/animal/:id" element={<AnimalDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;