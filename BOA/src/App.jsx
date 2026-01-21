import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainApp from './components/MainApp.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Set MainApp as the default home route since Login is deleted */}
        <Route path="/" element={<MainApp />} />
      </Routes>
    </Router>
  );
};

export default App;