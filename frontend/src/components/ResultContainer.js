import React, { useState, useEffect } from "react";

import ResultCard from './ResultCard';
// import data from './../data.json';

function ResultContainer() {
    const [results, setResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");


    // Simule le chargement des données depuis un backend
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/articles/")
          .then((response) => response.json())
          .then((data) => setResults(data))
          .catch((error) => console.error("Erreur lors du chargement des données :", error));
      }, []);
      

    const filteredResults = results.filter((result) => {
        const matchesSearch = result.title.toLowerCase().includes(searchTerm.toLowerCase()) 
                        || result.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "All" || result.category === filterCategory;
        return matchesSearch && matchesCategory;
    });
    return (
        <>
            <div className="filters-container">
            <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
            >
                <option value="All">Toutes les catégories</option>
                <option value="Veille Menaces">Veille Menaces</option>
                <option value="Cybersecurité">Cybersecurité</option>
            </select>
            </div>
            <div className="results-container">
            {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                <ResultCard key={index} result={result} />
                ))
            ) : (
                <p>Aucun résultat trouvé...</p>
            )}
            </div>
        </>
    )
}
export default ResultContainer;