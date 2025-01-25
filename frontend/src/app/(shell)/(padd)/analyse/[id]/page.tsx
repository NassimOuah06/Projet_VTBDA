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


export default function Page({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const data = searchParams.get('data');
    const router = useRouter();
    const [summary, setSummary] = useState<string | null>(null);
    const [keywords, setKeywords] = useState<string[] | null>(null);
    const [graphData, setGraphData] = useState<number[] | null>(null);
    const [loading, setLoading] = useState<'summary' | 'keywords' | null>(null);

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
                     // Diviser la chaîne en tableau
                     // Supprimer les espaces inutiles
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
