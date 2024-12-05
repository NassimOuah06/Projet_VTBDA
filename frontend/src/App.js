import {Route, Routes} from 'react-router-dom'
import React from "react";

// pages & components
import Navbar from './components/Navbar'
import ResultContainer from './components/ResultContainer';
import ArticleDetail from './components/ArticleDetail';

function App() {
  

  return (
    <div className="App">
      <Navbar />
        <Routes>
          <Route path="*" element={<ResultContainer />} />
          <Route path="/article/:articleId" element={<ArticleDetail />} />
        </Routes>
    </div>
  );
}

export default App;