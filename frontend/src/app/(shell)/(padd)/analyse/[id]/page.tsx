import { Center } from "@mantine/core";

export default function Page({ params }: { params: { id: number } }) {
    return (
        <Center>
            {params.id}
        </Center>
    )
}