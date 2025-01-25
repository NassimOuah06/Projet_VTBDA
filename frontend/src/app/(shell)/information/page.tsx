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
    "backdoor": "/images/backdoor.jpg",
    "cryptojacking": "/images/cryptojacking.jpg",
    "cyber crimes": "/images/cybercrimes.jpg",
    "darknet": "/images/darknet.jpg",
    "darkweb": "/images/darkweb.jpg",
    "ddos": "/images/ddos.png",
    "hacking": "/images/hacking.jpg",
    "malware": "/images/malware.jpg",
    "mitm": "/images/MITM.png",
    "phishing": "/images/phishing.png",
    "ransomware": "/images/ransomware.jpg",
    "rat": "/images/RAT.jpg",
    "rootkit": "/images/rootkit.png",
    "sql injection": "/images/sqlinjection.png",
    "trojan": "/images/trojan.jpg",
    "xss": "/images/XSS.jpg",
    "default1": "/images/atc.jpg",
    "default2": "/images/atc2.jpg",
    "default3": "/images/atc3.jpg",
    "default4": "/images/atc4.jpg",
    "default5": "/images/atc5.jpg",
    "default6": "/images/atc6.jpg",
    "default7": "/images/atc7.jpg",
    "default8": "/images/atc8.jpg",
    "default9": "/images/atc9.jpg"
};

const getImageForKeywords = (keywords: string): string => {
    const keywordList = keywords.split(',').map((keyword) => keyword.trim().toLowerCase());

    // Rechercher la première correspondance avec les mots-clés
    for (const keyword of keywordList) {
        if (KEYWORD_IMAGE_MAPPING[keyword]) {
            return KEYWORD_IMAGE_MAPPING[keyword];
        }
    }

    // Retourner une image par défaut si aucun mot-clé ne correspond
    const defaultImages = Object.values(KEYWORD_IMAGE_MAPPING).filter((key) =>
        key.startsWith('/images/atc')
    );
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
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
                        // Assurez-vous que chaque article a au moins un mot-clé
                        mot_cle: article.mot_cle || "default",
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
                        <Text style={{ wordWrap: 'break-word'}}>
                                {selectedArticle.created_at}
                            </Text>
                            <Text style={{ wordWrap: 'break-word'}}>
                                {selectedArticle.link}
                            </Text>
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