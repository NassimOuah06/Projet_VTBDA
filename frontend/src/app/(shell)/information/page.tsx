"use client"

import { Box, Button, Card, Center, Flex, Grid, Group, Image, Input, Text } from "@mantine/core";

import informations from "./information.json"
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
    return (
        <Flex direction={"column"} h={"100%"}>
            <Group p={15} className="shadow-lg z-10">
                <Text>Search:</Text>
                <Input
                    flex={1} 
                    placeholder="Title, theme, keyword, ..."
                    />
            </Group>
            <Flex
                p={15}
                gap={10}
                h={"100%"}
                style={{ overflow: "scroll" }}
                wrap={"wrap"}
            >
                {
                    informations.map((info, key) => (
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
                                    <Button>
                                        Read More
                                    </Button>
                                    <Button component={Link} href={`/analyse/${info.id}`} color="yellow" rightSection={<IconSearch size="1rem" />}>
                                        Analyse
                                    </Button>
                                </Group>
                            </Flex>
                        </Card>
                    ))
                }
            </Flex>
        </Flex>
    )
}