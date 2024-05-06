import React from 'react';
import './App.scss';

import Service36Extractor from './components/Service36Extractor/Service36Extractor';

import Nav from './components/Nav/Nav'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <div className="App">
      <Nav />
      <Service36Extractor />
      <Footer />
    </div>
  );
}

export default App;
