import { Avatar, Button, Center, Flex, Group, Text } from "@mantine/core";
import { IconDoorExit } from "@tabler/icons-react";

export default function Page() {
    return (
        <Flex direction="column" gap={20}>
            <Text
                size="xl"
                fw="bold"
            >
                Account Information
            </Text>
            <Flex align={"center"} flex={1} p={15} gap={15}>
                <Avatar size={150} color="initials" name="User User" />
                <Flex direction="column">
                    <Text size="md" fw="bold">User User</Text>
                    <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam dictum scelerisque accumsan. Curabitur placerat ac est in mattis. Phasellus ut laoreet nunc. Fusce suscipit velit quis velit accumsan, in finibus dolor tincidunt. Nullam urna magna, fringilla sed nibh eget, porttitor feugiat augue. Etiam eu tortor et sem accumsan euismod sit amet feugiat massa. Morbi ac mi nisl. Nulla volutpat diam at felis euismod, ac tincidunt justo tristique. In dictum leo at ex ullamcorper vestibulum. Maecenas lacinia quis mi ut porttitor</Text>
                </Flex>
            </Flex>
            <Group pl={"auto"} justify="end">
                <Button leftSection={<IconDoorExit size={"1rem"} stroke={3} />} color="red">
                    Logout
                </Button>
            </Group>
        </Flex>
    )
}