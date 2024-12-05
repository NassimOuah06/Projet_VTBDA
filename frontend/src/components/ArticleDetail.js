import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ArticleDetail() {
  const { articleId } = useParams(); // Récupérer l'ID de l'article dans l'URL
  const [article, setArticle] = useState(null); // Pour stocker l'article
  const [loading, setLoading] = useState(true); // Pour gérer le chargement
  const [error, setError] = useState(null); // Pour gérer les erreurs

  useEffect(() => {
    // Effectuer la requête GET pour récupérer l'article
    fetch(`http://127.0.0.1:8000/api/articles/${articleId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Article non trouvé");
        }
        return response.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false); // Changer l'état de loading à false lorsque les données sont chargées
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false); // Même si une erreur se produit, arrêter le chargement
      });
  }, [articleId]); // Refaire la requête si l'ID change

  // Si l'article est en train de charger
  if (loading) return <p>Chargement...</p>;

  // Si une erreur s'est produite
  if (error) return <p>{error}</p>;

  // Si l'article est disponible
  return (
    <div className="article-detail">
      <h1>{article.title}</h1>
      <p><strong>Catégorie:</strong> {article.category}</p>
      <p><strong>Date de publication:</strong> {new Date(article.date).toLocaleDateString()}</p>
      <p>{article.description}</p>
      <p>lorem3</p>
      <a href={article.link} target="_blank" rel="noopener noreferrer">
        Lire l'article complet
      </a>
    </div>
  );
}

export default ArticleDetail;
