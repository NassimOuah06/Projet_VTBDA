'use client';

import { Image, Text, Title, Button, Group, Loader, Box } from "@mantine/core";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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

type StatisticsData = {
    total_articles: number;
    articles_analysed: number;
    articles_finalised: number;
    most_common_keywords: { keyword: string; count: number }[];
};

export default function Page({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const data = searchParams.get('data');
    const router = useRouter();
    const [summary, setSummary] = useState<string | null>(null);
    const [keywords, setKeywords] = useState<string[] | null>(null);
    const [graphData, setGraphData] = useState<number[] | null>(null);
    const [graphKeyword, setGraphKeyword] = useState<string[] | null>(null);
    const [graphDataKeyword, setGraphDataKeyword] = useState<number[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const article = data ? JSON.parse(decodeURIComponent(data)) as ArticleInfo : null;

    // Fetch statistics data from the API
    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:8000/api/articles/statestique/');
                if (!response.ok) {
                    throw new Error('Failed to fetch statistics');
                }
                const data: StatisticsData = await response.json();
                setStatistics(data);
                console.log('Statistics data:', data);

                // Update graph data based on statistics
                const newGraphData = [
                    data.total_articles,
                    data.articles_analysed,
                    data.articles_finalised,
                ];
                setGraphData(newGraphData);
                setGraphKeyword(data.most_common_keywords.map((keyword) => keyword.keyword));
                setGraphDataKeyword(data.most_common_keywords.map((keyword) => keyword.count));
            } catch (error) {
                console.error('Error fetching statistics:', error);
                setError('Failed to fetch statistics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    const LineChart = () => {
        const data = {
            labels: graphKeyword || [],
            datasets: [
                {
                    label: 'Article Statistics',
                    data: graphDataKeyword || [],
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
                    text: 'Article Statistics (Line Chart)',
                },
            },
        };

        return <Line data={data} options={options} />;
    };

    const BarChart = () => {
        const data = {
            labels: ['Total Articles', 'Articles Analysed', 'Articles Finalised'],
            datasets: [
                {
                    label: 'Article Statistics',
                    data: graphData || [],
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
                    text: 'Article Statistics (Bar Chart)',
                },
            },
        };

        return <Bar data={data} options={options} />;
    };

    const PieChart = () => {
        const data = {
            labels: ['Total Articles', 'Articles Analysed', 'Articles Finalised'],
            datasets: [
                {
                    label: 'Article Statistics',
                    data: graphData || [],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
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
                    text: 'Article Statistics (Pie Chart)',
                },
            },
        };

        return <Pie data={data} options={options} />;
    };

    // Function to generate and download PDF
    const downloadPDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const chartsContainer = document.getElementById('charts-container');

        if (chartsContainer) {
            // Add title and date to the PDF
            const title = 'Article Statistics';
            const today = new Date().toLocaleDateString(); // Get today's date

            pdf.setFontSize(18);
            pdf.text(title, 105, 20, { align: 'center' }); // Add title at the top center
            pdf.setFontSize(12);
            pdf.text(`Date: ${today}`, 105, 30, { align: 'center' }); // Add date below the title

            // Capture the charts as an image
            const canvas = await html2canvas(chartsContainer);
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add the charts image to the PDF
            pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, imgHeight); // Adjust Y position to leave space for the title and date

            // Save the PDF with a filename that includes the title and date
            pdf.save(`${title}_${today.replace(/\//g, '-')}.pdf`);
        }
    };

    return (
        <div>
            <div style={{ padding: '20px', marginTop: '20px' }}>
                <Title order={3} style={{ marginBottom: '20px' }}>Article Statistics</Title>
                {/* Display loading state */}
                {loading && <Loader />}
                {/* Display error message */}
                {error && <Text color="red">{error}</Text>}
                {/* Display statistics */}
                {/* {statistics && (
                    <Box mb="md">
                        <Text>Total Articles: {statistics.total_articles}</Text>
                        <Text>Articles Analysed: {statistics.articles_analysed}</Text>
                        <Text>Articles Finalised: {statistics.articles_finalised}</Text>
                        <Text>Most Common Keywords:</Text>
                        <ul>
                            {statistics.most_common_keywords.map((keyword, index) => (
                                <li key={index}>{keyword.keyword}: {keyword.count}</li>
                            ))}
                        </ul>
                    </Box>
                )} */}
                {/* Add a button to download PDF */}
                <Button onClick={downloadPDF} style={{ marginBottom: '20px' }}>
                    Download PDF
                </Button>
                <Group align="flex-start" id="charts-container">
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
        </div>
    );
}