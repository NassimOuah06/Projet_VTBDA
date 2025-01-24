"use client"

import { Anchor, AppShell, Avatar, Box, Burger, Flex, Group, Indicator, NavLink, Text } from "@mantine/core";
import { forwardRef, Key, PropsWithChildren, ReactElement, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks"
import { usePathname } from "next/navigation";
import { config, NavBarItem } from "@/config";
import { IconBellFilled, IconChevronRight, IconFileInfo } from "@tabler/icons-react";
import Link from "next/link";

const MyNavLink = forwardRef<HTMLAnchorElement, { item: NavBarItem }>(({ item }, ref) => {
    const pathname = usePathname()
    return (
        <NavLink
            ref={ref}
            component={Link}
            href={item.path}
            label={item.label}
            active={pathname == item.path}
            rightSection={item.withCheveron && (<IconChevronRight size={"1rem"} />)}
            leftSection={(<item.icon size={"1.5rem"} />)}
        />
    )
});


export default function Layout({ children }: PropsWithChildren) {
    const [opened, { toggle, close }] = useDisclosure()
    const pathname = usePathname()

    useEffect(() => {
        close()
    }, [pathname])

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            h={"100dvh"}
            style={{ overflow: "hidden" }}
            padding={0}>
            <AppShell.Header p={10} renderRoot={(props) => <Flex align={"center"} {...props} />}>
                <Group gap={5}>
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Text>Logo</Text>
                </Group>
                <Box flex={1} />
                <Group gap={10}>
                    <Avatar component="a" href="/account" color="initials" name="User User" />
                    <Anchor c="dark" href="/notifications">
                        <Indicator processing offset={3} size={8}>
                            <IconBellFilled />
                        </Indicator>
                    </Anchor>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar>
                {
                    config.navbar.top.map((item, key) => (
                        <MyNavLink key={key} item={item} />
                    ))
                }
                <Box flex={1} />
                {
                    config.navbar.bottom?.map((item, key) => (
                        <MyNavLink key={key} item={item} />
                    ))
                }
            </AppShell.Navbar>
            <AppShell.Main h={"100%"} style={{ overflow: "hidden" }}>
                {children}
            </AppShell.Main>
        </AppShell>
    )
}