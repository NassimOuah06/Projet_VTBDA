'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect
import { Box, Button, Card, Center, Flex, Grid, Group, Image, Input, Text, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import informations from "./information.json";
import { IconSearch } from "@tabler/icons-react";
import { useRouter } from 'next/navigation';

type ArticleInfo = {
    id: number;
    name: string;
    image: string;
    text: string;
};

export default function Page() {
    const router = useRouter();
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedArticle, setSelectedArticle] = useState<ArticleInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    console.log("Page component rendered");

    useEffect(() => {
        const email = sessionStorage.getItem('email');
        const password = sessionStorage.getItem('password');

        if (email && password) {
            console.log("Retrieved email from session storage:", email);
            console.log("Retrieved password from session storage:", password);
        } else {
            console.log("No email or password found in session storage.");
        }
    }, []);

    const handleAnalyseClick = (info: ArticleInfo) => {
        console.log("Analyse button clicked for article:", info.name);
        const url = `/analyse/${info.id}?data=${encodeURIComponent(JSON.stringify(info))}`;
        console.log("Navigating to:", url);
        router.push(url);
    };

    const handleReadMoreClick = (info: ArticleInfo) => {
        console.log("Read More button clicked for article:", info.name);
        setSelectedArticle(info);
        open();
    };

    const filteredArticles = informations.filter((info) => {
        const query = searchQuery.toLowerCase();
        return (
            info.name.toLowerCase().includes(query) ||
            info.text.toLowerCase().includes(query)
        );
    });

    console.log("Filtered articles:", filteredArticles);

    return (
        <Flex direction={"column"} h={"100%"}>
            <Modal
                opened={opened}
                onClose={close}
                title={selectedArticle?.name}
                size="lg"
                overlayProps={{ blur: 3 }}
            >
                {selectedArticle && (
                    <div>
                        <Image src={selectedArticle.image} alt={selectedArticle.name} mb="md" />
                        <Text>{selectedArticle.text}</Text>
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
                            <Image h={200} src={info.image} />
                        </Card.Section>
                        <Flex direction="column" p={10} gap={15}>
                            <Flex gap={5} direction="column">
                                <Text fw={600}>{info.name}</Text>
                                <Text size="sm" c="dimmed" lineClamp={5}>{info.text}</Text>
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