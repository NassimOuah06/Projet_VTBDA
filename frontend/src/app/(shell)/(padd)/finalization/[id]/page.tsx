'use client';

import { Title, Text, Box, Group, Button } from "@mantine/core";
import { useSearchParams, useParams } from 'next/navigation';
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
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Packer } from 'docx';
import { Document, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';

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

export default function FinalizationPage() {
    const searchParams = useSearchParams();
    const params = useParams();

    const articleName = searchParams.get('articleName') ? decodeURIComponent(searchParams.get('articleName')!) : 'Unnamed Article';
    const summary = searchParams.get('summary');
    const keywords = searchParams.get('keywords');
    const graphData = searchParams.get('graphData');
    const swot = searchParams.get('swot');
    const menace = searchParams.get('menace');

    const decodedSummary = summary ? decodeURIComponent(summary) : null;
    const decodedKeywords = keywords ? JSON.parse(decodeURIComponent(keywords)) : null;
    const decodedGraphData = graphData ? JSON.parse(decodeURIComponent(graphData)) : null;
    const decodedSwot = swot ? JSON.parse(decodeURIComponent(swot)) : null;
    const decodedMenace = menace ? JSON.parse(decodeURIComponent(menace)) : null;

    const LineChart = () => {
        if (!decodedGraphData) return null;

        const data = {
            labels: decodedGraphData.map((_: any, index: number) => `Point ${index + 1}`),
            datasets: [
                {
                    label: 'Line Chart Data',
                    data: decodedGraphData,
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
        if (!decodedGraphData) return null;

        const data = {
            labels: decodedGraphData.map((_: any, index: number) => `Bar ${index + 1}`),
            datasets: [
                {
                    label: 'Bar Chart Data',
                    data: decodedGraphData,
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
        if (!decodedGraphData) return null;

        const data = {
            labels: decodedGraphData.map((_: any, index: number) => `Pie ${index + 1}`),
            datasets: [
                {
                    label: 'Pie Chart Data',
                    data: decodedGraphData,
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
                    position: 'top' as 'top',
                },
                title: {
                    display: true,
                    text: 'Pie Chart Visualization',
                },
            },
        };

        return <Pie data={data} options={options} />;
    };

    const downloadAsPDF = async () => {
        const element = document.getElementById('analysis-content');
        if (!element) return;

        const articleTitle = `Article: ${articleName}`;

        const marginLeft = 20;
        const marginRight = 20;
        const marginTop = 30;
        const marginBottom = 20;

        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth() - marginLeft - marginRight;
        const pdfHeight = pdf.internal.pageSize.getHeight() - marginTop - marginBottom;

        const canvas = await html2canvas(element, {
            scale: 3,
        });

        const imgData = canvas.toDataURL('image/png');

        pdf.setFontSize(24);
        pdf.text(articleTitle, marginLeft, marginTop - 10);

        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;

        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const width = imgWidth * ratio;
        const height = imgHeight * ratio;

        pdf.addImage(imgData, 'PNG', marginLeft, marginTop, width, height);

        pdf.save(`analysis-report-${articleName}.pdf`);
    };

    const downloadAsWord = () => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Analysis Report',
                                    bold: true,
                                    size: 24,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Article: ${articleName}`,
                                    size: 20,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Summary: ${decodedSummary || 'No summary available'}`,
                                    size: 20,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Keywords: ${decodedKeywords ? decodedKeywords.join(', ') : 'No keywords available'}`,
                                    size: 20,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'Charts are included as images in the PDF version.',
                                    size: 20,
                                }),
                            ],
                        }),
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, 'analysis-report.docx');
        });
    };

    const shareViaEmail = async () => {
        const element = document.getElementById('analysis-content');
        if (!element) return;

        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `analysis-report-${articleName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const subject = `Analysis Report for Article: ${articleName}`;
        const body = `Please find the analysis report attached.\n\nSummary:\n${decodedSummary || 'No summary available'}\n\nKeywords:\n${decodedKeywords ? decodedKeywords.join(', ') : 'No keywords available'}`;

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);

        const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;

        window.location.href = mailtoUrl;

        alert('The PDF has been downloaded. Please attach it manually to the email.');
    };

    return (
        <div style={{ padding: '20px' }}>
            <Title>Finalization for Article: {articleName}</Title>

            <div id="analysis-content">
                {/* Display Summary */}
                {decodedSummary && (
                    <Box style={{ marginTop: '20px' }}>
                        <Title order={3}>Summary</Title>
                        <Text>{decodedSummary}</Text>
                    </Box>
                )}

                {/* Display Keywords */}
                {decodedKeywords && (
                    <Box style={{ marginTop: '20px' }}>
                        <Title order={3}>Extracted Keywords</Title>
                        <Group>
                            {decodedKeywords.map((keyword: string, index: number) => (
                                <Text key={index} style={{ padding: '5px 10px', borderRadius: '4px', margin: '5px', display: 'inline-block' }}>
                                    {keyword}
                                </Text>
                            ))}
                        </Group>
                    </Box>
                )}

                {/* Display SWOT Analysis */}
                {decodedSwot && (
    <Box style={{ marginTop: '20px' }}>
        <Title order={3}>SWOT Analysis</Title>
        {Object.entries(decodedSwot).map(([key, value]) => (
            <div key={key}>
                <Title order={4}>{key}</Title>
                <Text>{value as string}</Text>
            </div>
        ))}
    </Box>
)}

                {/* Display Menace Analysis */}
                {decodedMenace && (
                    <Box style={{ marginTop: '20px' }}>
                        <Title order={3}>Menace Analysis</Title>

                        {/* Display Mots-clés */}
                        {decodedMenace.mots_cles && (
                            <Box style={{ marginTop: '10px' }}>
                                <Title order={4}>Mots-clés</Title>
                                <ul>
                                    {decodedMenace.mots_cles.map((mot: string, index: number) => (
                                        <li key={index}>{mot}</li>
                                    ))}
                                </ul>
                            </Box>
                        )}

                        {/* Display Patterns Suspects */}
                        {decodedMenace.patterns_suspects && (
                            <Box style={{ marginTop: '10px' }}>
                                <Title order={4}>Patterns Suspects</Title>
                                <ul>
                                    {decodedMenace.patterns_suspects.map((pattern: string, index: number) => (
                                        <li key={index}>{pattern}</li>
                                    ))}
                                </ul>
                            </Box>
                        )}

                        {/* Display Entités Nommées */}
                        {decodedMenace.entites_nommees && (
                            <Box style={{ marginTop: '10px' }}>
                                <Title order={4}>Entités Nommées</Title>
                                {Object.entries(decodedMenace.entites_nommees).map(([type, entites]) => (
                                    <div key={type}>
                                        <Title order={5}>{type}</Title>
                                        <ul>
                                            {(entites as string[]).map((entite: string, index: number) => (
                                                <li key={index}>{entite}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </Box>
                        )}

                        {/* Display Technologies et Outils */}
                        {decodedMenace.technologies_et_outils && (
                            <Box style={{ marginTop: '10px' }}>
                                <Title order={4}>Technologies et Outils</Title>
                                <ul>
                                    {decodedMenace.technologies_et_outils.map((tech: string, index: number) => (
                                        <li key={index}>{tech}</li>
                                    ))}
                                </ul>
                            </Box>
                        )}

                        {/* Display Méthodes d'Attaque */}
                        {decodedMenace.methodes_attaque && (
                            <Box style={{ marginTop: '10px' }}>
                                <Title order={4}>Méthodes d'Attaque</Title>
                                <ul>
                                    {decodedMenace.methodes_attaque.map((methode: string, index: number) => (
                                        <li key={index}>{methode}</li>
                                    ))}
                                </ul>
                            </Box>
                        )}
                    </Box>
                )}
            </div>

            {/* Download and Share Buttons */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Group justify="center">
                    <Button
                        variant="filled"
                        color="blue"
                        size="md"
                        onClick={downloadAsPDF}
                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        Download as PDF
                    </Button>
                    <Button
                        variant="outline"
                        color="teal"
                        size="md"
                        onClick={downloadAsWord}
                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        Download as Word
                    </Button>
                    <Button
                        variant="outline"
                        color="orange"
                        size="md"
                        onClick={shareViaEmail}
                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        Share via Email
                    </Button>
                </Group>
            </div>
        </div>
    );
}