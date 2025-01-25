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
    const [loading, setLoading] = useState<'summary' | 'keywords' |'swot' | 'menace' | null>(null);

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
            const mockKeywords = ['mockKeyword1', 'mockKeyword2', 'mockKeyword3'];
            setKeywords(mockKeywords);
        } catch (error) {
            console.error('Error fetching keywords:', error);
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

    const handleFinalization = () => {
        console.log('Article Object:', article);
        console.log('Data Query Parameter:', data);

        const queryParams = new URLSearchParams();
        if (summary) queryParams.set('summary', encodeURIComponent(summary));
        if (keywords) queryParams.set('keywords', encodeURIComponent(JSON.stringify(keywords)));
        if (graphData) queryParams.set('graphData', encodeURIComponent(JSON.stringify(graphData)));
        if (article) {
            queryParams.set('articleName', encodeURIComponent(article.title));
            console.log('Article Name:', article.title);
        }
        console.log('Finalization query params:', queryParams.toString());
        router.push(`/finalization/${article?.id}?${queryParams.toString()}`);
    };

    const LineChart = () => {
        if (!graphData) return null;

        const data = {
            labels: graphData.map((_, index) => `Point ${index + 1}`),
            datasets: [
                {
                    label: 'Line Chart Data',
                    data: graphData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                },
            ],
        };
        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                title: {
                    display: true,
                    text: 'Line Chart Visualization',
                },
            },
        };

        return <Line data={data} options={options} />;
    };

    const BarChart = () => {
        if (!graphData) return null;

        const data = {
            labels: graphData.map((_, index) => `Bar ${index + 1}`),
            datasets: [
                {
                    label: 'Bar Chart Data',
                    data: graphData,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top' as 'top',
                },
                title: {
                    display: true,
                    text: 'Bar Chart Visualization',
                },
            },
        };

        return <Bar data={data} options={options} />;
    };

    const PieChart = () => {
        if (!graphData) return null;

        const data = {
            labels: graphData.map((_, index) => `Pie ${index + 1}`),
            datasets: [
                {
                    label: 'Pie Chart Data',
                    data: graphData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(199, 199, 199, 0.6)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                title: {
                    display: true,
                    text: 'Pie Chart Visualization',
                },
            },
        };

        return <Pie data={data} options={options} />;
    };

    return (
        <div>
            <div style={{ padding: '20px', minHeight: 'auto', overflowY: 'visible', border: '1px solid green' }}>
                {article ? (
                    <div>
                        <Title>{article.title}</Title>

                        <div style={{ maxWidth: '800px', overflow: 'visible', border: '1px solid red' }}>
                            <Image src={article.image} alt={article.title} my="md" />
                        </div>
                        <div>
                            <Text style={{ wordWrap: 'break-word', whiteSpace: 'normal', border: '1px solid blue' }}>
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
                    <Button
                        variant="outline"
                        color="purple"
                        size="md"
                        onClick={handleGraphData}
                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        Fetch Graph Data
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
                {menace.entites_nommees.ORG.map((org, index) => (
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
        <div style={{ marginBottom: '15px' }}>
            <h4 style={{ fontWeight: 'bold' }}>Mots-Clés</h4>
            <ul>
                {menace.mots_cles.map((mot, index) => (
                    <li key={index}>{mot}</li>
                ))}
            </ul>
        </div>

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

            {/* Display Charts */}
            {graphData && (
                <div style={{ padding: '20px', marginTop: '20px' }}>
                    <Title order={3} style={{ marginBottom: '20px' }}>Chart Visualizations</Title>
                    <Group align="flex-start">
                        <Box style={{ width: '45%', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                            <Title order={4}>Line Chart</Title>
                            <LineChart />
                        </Box>
                        <Box style={{ width: '45%', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                            <Title order={4}>Bar Chart</Title>
                            <BarChart />
                        </Box>
                        <Box style={{ width: '45%', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                            <Title order={4}>Pie Chart</Title>
                            <PieChart />
                        </Box>
                    </Group>
                </div>
            )}

            {(summary || keywords || graphData) && (
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
