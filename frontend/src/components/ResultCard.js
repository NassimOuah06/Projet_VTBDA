import React from "react";
import { Link } from "react-router-dom";

function ResultCard({ result }) {
  const { title, description, category, date, id } = result;

  return (
    <div className="result-card">
      <div className="result-card-header">
        <h2>{title}</h2>
        <span className="category-badge">{category}</span>
      </div>
      {/* <p className="result-description">{description}</p> */}
      <p className="result-date">Publié le : {new Date(date).toLocaleDateString()}</p>
      {/* Lien vers la page de détail */}
      <Link to={`/article/${id}`} className="result-link">
        Voir plus
      </Link>
    </div>
  );
}

export default ResultCard;
