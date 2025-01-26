'use client';

import { Image, Text, Title, Button, Group, Loader, Box } from "@mantine/core";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend
);

type ArticleInfo = {
    id: number;
    title: string;
    description: string;
    link: string;
    mot_cle: string;
    created_at: string;
    image: string;
    analyser: boolean;
    finaliser: boolean;
};

type MenaceInfo = {
    entites_nommees: { ORG: string[] };
    methodes_attaque: string[];
    mots_cles: string[];
    patterns_suspects: string[];
    technologies_et_outils: string[];
        Rapport: string;
};


export default function Page({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const data = searchParams.get('data');
    const router = useRouter();
    const [summary, setSummary] = useState<string | null>(null);
    const [swot,setSwot]=useState<string | null>(null);
    const [menace, setMenace] = useState<MenaceInfo | null>(null);
    const [keywords, setKeywords] = useState<string[] | null>(null);
    const [graphData, setGraphData] = useState<number[] | null>(null);
    const [loading, setLoading] = useState<'summary' | 'keywords' | 'swot' | 'menace' | null>(null);

    const article = data ? JSON.parse(decodeURIComponent(data)) as ArticleInfo : null;

    const handleSummary = async () => {
        if (!article) return;

        setLoading('summary');
        try {
            console.log('Article ID:', article.id , 'Article Name:', article.title);
            const response = await fetch(`http://localhost:8000/api/articles/resumer/${article.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch summary');
            }

            const data = await response.json();
            setSummary(data.summary);
            article.analyser = true;
            console.log(summary)
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setLoading(null);
        }
    };

    const handelSwot = async () => {
        if (!article) return;  
        try {
            console.log('Article ID:', article.id, 'Article Name:', article.title);
            
            // Envoyer le texte de l'article dans le corps de la requête
            const response = await fetch(`http://localhost:8000/api/swot/${article.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: article.description }), // Supposons que le texte de l'article est dans `article.content`
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch swot');
            }
    
            const data = await response.json();
            setSwot(data); // Utiliser `data` directement car la réponse contient les résultats SWOT
            article.analyser = true;
            console.log(data); // Afficher les résultats SWOT
        } catch (error) {
            console.error('Error fetching swot:', error);
        } finally {
            setLoading(null);
        }
    };

    const handelMenace = async () => {
        if (!article) return;  
        try {
            console.log('Article ID:', article.id, 'Article Name:', article.title);
            
            // Envoyer le texte de l'article dans le corps de la requête
            const response = await fetch(`http://localhost:8000/api/articles/analyser/${article.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: article.description }), // Supposons que le texte de l'article est dans `article.content`
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch swot');
            }
    
            const data = await response.json();
            setMenace(data.Rapport); // Utiliser `data` directement car la réponse contient les résultats SWOT
             // Afficher les résultats SWOT
            article.analyser = true;
        } catch (error) {
            console.error('Error fetching swot:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleKeywords = async () => {
        if (!article) return;
    
        setLoading('keywords');
        try {
            // Appeler l'endpoint Django pour récupérer les détails de l'article
            const response = await fetch(`http://127.0.0.1:8000/api/articles/${article.id}`, {
                method: 'GET', // Méthode HTTP
                headers: {
                    'Content-Type': 'application/json', // Type de contenu
                },
            });
    
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des détails de l\'article');
            }
    
            const data = await response.json(); // Convertir la réponse en JSON
            console.log('Détails de l\'article:', data);
    
             // Diviser data.mot_cle en un ensemble de mots-clés uniques
             const mockKeywords = new Set(
                data.mot_cle
                    .split(',') // Diviser la chaîne en tableau
                    .map((keyword: string) => keyword.trim()) // Supprimer les espaces inutiles
                    .filter((keyword: string) => keyword.length > 0) // Supprimer les chaînes vides
            );

            // Convertir le Set en tableau (si nécessaire)
            const uniqueKeywords = Array.from(mockKeywords);

            // Mettre à jour l'état des mots-clés
            setKeywords(uniqueKeywords as string[]);
    
        } catch (error) {
            console.error('Erreur lors de la récupération des détails de l\'article:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleGraphData = async () => {
        if (!article) return;

        try {
            const mockGraphData = [10, 20, 30, 40, 50, 60, 70];
            setGraphData(mockGraphData);
        } catch (error) {
            console.error('Error fetching graph data:', error);
        }
    };

    // const handleFinalization = () => {
    //     console.log('Article Object:', article);
    //     console.log('Data Query Parameter:', data);

    //     const queryParams = new URLSearchParams();
    //     if (summary) queryParams.set('summary', encodeURIComponent(summary));
    //     if (keywords) queryParams.set('keywords', encodeURIComponent(JSON.stringify(keywords)));
    //     if (swot) queryParams.set('swot', encodeURIComponent(JSON.stringify(swot)));
    //     if (menace) queryParams.set('menace', encodeURIComponent(JSON.stringify(menace)));
    //     if (graphData) queryParams.set('graphData', encodeURIComponent(JSON.stringify(graphData)));
    //     if (article) {
    //         queryParams.set('articleName', encodeURIComponent(article.title));
    //         console.log('Article Name:', article.title);
    //     }
    //     console.log('Finalization query params:', queryParams.toString());
        
    //     router.push(`/finalization/${article?.id}?${queryParams.toString()}`);
    // };

    const handleFinalization = async () => {
        console.log('Article Object:', article);
        console.log('Data Query Parameter:', data);
    
        // Prepare the payload for the API request
        const payload = {
            summary: summary,
            keywords: keywords,
            swot: swot,
            menace: menace,
            graphData: graphData,
            articleName: article?.title,
        };
    
        try {
            // Make a POST request to the Django backend API
            const response = await fetch(`http://localhost:8000/api/articles/finaliser/${article?.id}`, {
                method: 'POST', // Use POST to send data
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // Send the payload as JSON
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            console.log('API Response:', result);
    
            const queryParams = new URLSearchParams();
            if (summary) queryParams.set('summary', encodeURIComponent(summary));
            if (keywords) queryParams.set('keywords', encodeURIComponent(JSON.stringify(keywords)));
            if (swot) queryParams.set('swot', encodeURIComponent(JSON.stringify(swot)));
            if (menace) queryParams.set('menace', encodeURIComponent(JSON.stringify(menace)));
            if (graphData) queryParams.set('graphData', encodeURIComponent(JSON.stringify(graphData)));
            if (article) {
                queryParams.set('articleName', encodeURIComponent(article.title));
                console.log('Article Name:', article.title);
            }
            console.log('Finalization query params:', queryParams.toString());
    
            router.push(`/finalization/${article?.id}?${queryParams.toString()}`);
        } catch (error) {
            console.error('Error finalizing article:', error);
            alert('Failed to finalize article. Please try again.');
        }
    };

    return (
        <div>
            <div style={{ padding: '20px', minHeight: 'auto', overflowY: 'visible'}}>
                {article ? (
                    <div>
                        <Title>{article.title}</Title>

                        <div style={{ maxWidth: '800px', overflow: 'visible' }}>
                            <Image src={article.image} alt={article.title} my="md" />
                        </div>
                        <div>
                            <Text style={{ wordWrap: 'break-word', whiteSpace: 'normal'}}>
                                {article.description}
                            </Text>
                        </div>
                    </div>
                ) : (
                    <Text>Article not found.</Text>
                )}
            </div>

            <div style={{ padding: '20px', textAlign: 'center', marginTop: '20px' }}>
                <Group justify="center">
                    <Button
                        variant="filled"
                        color="blue"
                        size="md"
                        onClick={handleSummary}
                        disabled={loading === 'summary'}
                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        {loading === 'summary' ? <Loader size="sm" /> : 'Summary'}
                    </Button>
                    <Button
                        variant="filled"
                        color="orange"
                        size="md"
                        onClick={handelSwot}
                        disabled={loading === 'swot'}
                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        {loading === 'swot' ? <Loader size="sm" /> : 'Swot'}
                    </Button>
                    <Button
                        variant="filled"
                        color="red"
                        size="md"
                        onClick={handelMenace}
                        disabled={loading === 'menace'}
                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        {loading === 'swot' ? <Loader size="sm" /> : 'Extract Menace'}
                    </Button>
                    <Button
                        variant="outline"
                        color="teal"
                        size="md"
                        onClick={handleKeywords}
                        disabled={loading === 'keywords'}
                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        {loading === 'keywords' ? <Loader size="sm" /> : 'Extract Keywords'}
                    </Button>
                </Group>
            </div>

            {summary && (
                <Box style={{ padding: '20px', marginTop: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <Title order={3}>Summary</Title>
                    <Text>{summary}</Text>
                </Box>
            )}
            {swot && (
                <Box style={{ padding: '20px', marginTop: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <Title order={3}>Swot Analysis</Title>
                    {Object.entries(swot).map(([category, sentences]) => (
                        <div key={category} style={{ marginBottom: '16px' }}>
                            <Title order={4} style={{ marginBottom: '8px' }}>{category}</Title>
                            <ul>
                                {Array.isArray(sentences) && sentences.map((sentence: string, index: number) => (
                                    <li key={index}>{sentence}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </Box>
            )}
            {menace && (
                <Box
                    style={{
                        padding: '20px',
                        marginTop: '20px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                    }}
                >
                    <Title order={3} style={{ marginBottom: '20px' }}>
                        <strong>Menace Analysis</strong>
                    </Title>

                    {/* Entités Nommées */}
                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ fontWeight: 'bold' }}>Entités Nommées (ORG)</h4>
                       
                        <ul>
                            {menace.entites_nommees?.ORG?.map((org, index) => (
                                <li key={index}>{org}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Méthodes d'Attaque */}
                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ fontWeight: 'bold' }}>Méthodes d'Attaque</h4>
                        <ul>
                            {menace.methodes_attaque.map((methode, index) => (
                                <li key={index}>
                                    {methode
                                        .replace(/\\b\(\?:/g, '') // Supprime \b(?: pour nettoyer les regex
                                        .replace(/\\b/g, '') // Supprime \b
                                        .replace(/\|/g, ', ') // Remplace les | par des virgules pour une meilleure lisibilité
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Mots-Clés */}
                    {/* <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ fontWeight: 'bold' }}>Mots-Clés</h4>
                        <ul>
                            {menace.mots_cles.map((mot, index) => (
                                <li key={index}>{mot}</li>
                            ))}
                        </ul>
                    </div>  */}

                    {/* Patterns Suspects */}
                    <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ fontWeight: 'bold' }}>Patterns Suspects</h4>
                        <ul>
                            {menace.patterns_suspects.map((pattern, index) => (
                                <li key={index}>
                                    {pattern
                                        .replace(/\\b\(\?:/g, '') // Supprime \b(?: pour nettoyer les regex
                                        .replace(/\\b/g, '') // Supprime \b
                                        .replace(/\|/g, ', ') // Remplace les | par des virgules pour une meilleure lisibilité
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Technologies et Outils */}
                    <div>
                        <h4 style={{ fontWeight: 'bold' }}>Technologies et Outils</h4>
                        <ul>
                            {menace.technologies_et_outils.map((tech, index) => (
                                <li key={index}>{tech}</li>
                            ))}
                        </ul>
                    </div>
                </Box>
            )}

            {keywords && (
                <Box style={{ padding: '20px', marginTop: '20px'}}>
                    <Title order={3}>Extracted Keywords</Title>
                    <Group>
                        {keywords.map((keyword, index) => (
                            <Text key={index} style={{  padding: '5px 10px'}}>
                                {keyword}
                            </Text>
                        ))}
                    </Group>
                </Box>
            )}

            {(summary || swot || menace || keywords || graphData) && (
                <div style={{ padding: '20px', textAlign: 'center', marginTop: '20px' }}>
                    <Button
                        variant="filled"
                        color="orange"
                        size="md"
                        onClick={handleFinalization}
                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        Send to Finalization
                    </Button>
                </div>
            )}
        </div>
    );
}
