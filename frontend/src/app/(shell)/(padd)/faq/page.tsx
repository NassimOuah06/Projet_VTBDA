"use client"

import { Accordion, Center, Flex, Text } from "@mantine/core";

import faqs from "./faqs.json"

export default function Page() {
    return (
        <Flex gap={15} direction="column">
            <Text size="xl" fw={"bold"}>FAQ</Text>
            <Text c="dimmed">
                You have questions about the use of this tool ? Checkout our FAQ.
            </Text>
            <Accordion multiple>
                {
                    faqs.map((faq, key) => (
                        <Accordion.Item key={key} value={faq.question}>
                            <Accordion.Control>
                                {faq.question}
                            </Accordion.Control>
                            <Accordion.Panel pl={15} c="dimmed">
                                {faq.answer}
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))
                }
            </Accordion>
        </Flex>
    )
}