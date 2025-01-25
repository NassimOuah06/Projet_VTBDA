'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Card, Center, Flex, Grid, Group, Image, Input, Text, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useRouter } from 'next/navigation';

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

const KEYWORD_IMAGE_MAPPING: { [key: string]: string } = {
    "backdoor": "information/images/backdoor.jpg",
    "cryptojacking": "information/images/cryptojacking.jpg",
    "cyber crimes": "information/images/cybercrimes.jpg",
    "darknet": "information/images/darknet.jpg",
    "darkweb": "information/images/darkweb.jpg",
    "ddos": "information/images/ddos.png",
    "hacking": "information/images/hacking.jpg",
    "malware": "information/images/malware.jpg",
    "mitm": "information/images/MITM.png",
    "phishing": "information/images/phishing.png",
    "ransomware": "information/images/ransomware.jpg",
    "rat": "information/images/RAT.jpg",
    "rootkit": "information/images/rootkit.png",
    "sql injection": "information/images/sqlinjection.png",
    "trojan": "information/images/trojan.jpg",
    "xss": "information/images/XSS.jpg",
};

const getImageForKeywords = (keywords: string): string => {
    // Diviser la chaîne de mots-clés en un tableau
    const keywordList = keywords.split(',').map(keyword => keyword.trim().toLowerCase());

    // Trouver la première image correspondante
    for (const keyword of keywordList) {
        if (KEYWORD_IMAGE_MAPPING[keyword]) {
            return KEYWORD_IMAGE_MAPPING[keyword];
        }
    }

    // Si aucun mot-clé ne correspond, retourner une image par défaut
    return "/images/default.jpg";
};
export default function Page() {
    const router = useRouter();
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedArticle, setSelectedArticle] = useState<ArticleInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [articles, setArticles] = useState<ArticleInfo[]>([]);

    useEffect(() => {
    // Fetch articles from the Django backend
    const fetchArticles = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/articles/');
            if (response.ok) {
                const data = await response.json();
                // Map articles to include the corresponding image
                const articlesWithImages = data.map((article: ArticleInfo) => ({
                    ...article,
                    image: getImageForKeywords(article.mot_cle), // Utiliser la fonction pour obtenir l'image
                }));
                setArticles(articlesWithImages);
            } else {
                console.error('Failed to fetch articles');
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };
    
    fetchArticles();
}, []);

    const handleAnalyseClick = (info: ArticleInfo) => {
        console.log("Analyse button clicked for article:", info.title);
        const url = `/analyse/${info.id}?data=${encodeURIComponent(JSON.stringify(info))}`;
        console.log("Navigating to:", url);
        router.push(url);
        
    };
    
    const handleReadMoreClick = (info: ArticleInfo) => {
        console.log("Read More button clicked for article:", info.title);
        setSelectedArticle(info);
        
        open();
    };

    const filteredArticles = articles.filter((info) => {
        const query = searchQuery.toLowerCase();
        return (
            info.title.toLowerCase().includes(query) ||
            info.description.toLowerCase().includes(query)
        );
    });

    return (
        <Flex direction={"column"} h={"100%"}>
            <Modal
                opened={opened}
                onClose={close}
                title={selectedArticle?.title}
                size="lg"
                overlayProps={{ blur: 3 }}
            >
                {selectedArticle && (
                    <div>
                        <Image src={selectedArticle.image} alt={selectedArticle.title} mb="md" />
                        <Text>{selectedArticle.description}</Text>
                    </div>
                )}
            </Modal>

            <Group p={15} className="shadow-lg z-10">
                <Text>Search:</Text>
                <Input
                    flex={1}
                    placeholder="Title, theme, keyword, ..."
                    value={searchQuery}
                    onChange={(event) => {
                        console.log("Search query updated:", event.target.value);
                        setSearchQuery(event.target.value);
                    }}
                />
            </Group>

            <Flex
                p={15}
                gap={10}
                h={"100%"}
                style={{ overflow: "scroll" }}
                wrap={"wrap"}
            >
                {filteredArticles.map((info, key) => (
                    <Card
                        shadow="sm"
                        withBorder
                        flex={"1 1 300px"}
                        key={key}
                    >
                        <Card.Section>
                            <Image h={200} src={info.image} alt={info.title} />
                        </Card.Section>
                        <Flex direction="column" p={10} gap={15}>
                            <Flex gap={5} direction="column">
                                <Text fw={600}>{info.title}</Text>
                                <Text size="sm" c="dimmed" lineClamp={5}>{info.description}</Text>
                            </Flex>
                            <Group grow>
                                <Button onClick={() => handleReadMoreClick(info)}>
                                    Read More
                                </Button>
                                <Button
                                    onClick={() => handleAnalyseClick(info)}
                                    color="yellow"
                                    rightSection={<IconSearch size="1rem" />}
                                >
                                    Analyse
                                </Button>
                            </Group>
                        </Flex>
                    </Card>
                ))}
            </Flex>
        </Flex>
    );
}