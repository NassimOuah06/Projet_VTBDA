'use client';

import scrapperImage from '../res/scrapper.png';
import { Anchor, AppShell, Avatar, Box, Burger, Flex, Group, Indicator, Modal, NavLink, Text, TextInput, Button } from "@mantine/core";
import { forwardRef, PropsWithChildren, useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { config, NavBarItem } from "@/config";
import { IconBellFilled, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

const MyNavLink = forwardRef<HTMLAnchorElement, { item: NavBarItem }>(({ item }, ref) => {
    const pathname = usePathname();
    return item.disabled ? (
        <NavLink
            component="div" 
            label={item.label}
            active={pathname === item.path}
            rightSection={item.withCheveron && (<IconChevronRight size={"1rem"} />)}
            leftSection={<item.icon size={"1.5rem"} />}
            disabled={item.disabled}
            style={{ cursor: "not-allowed" }} 
        />
    ) : (
        <NavLink
            component={Link}
            href={item.path}
            ref={ref}
            label={item.label}
            active={pathname === item.path}
            rightSection={item.withCheveron && (<IconChevronRight size={"1rem"} />)}
            leftSection={<item.icon size={"1.5rem"} />}
            style={{ cursor: "pointer" }}
        />
    );
});

export default function Layout({ children }: PropsWithChildren) {
    const [opened, { toggle, close }] = useDisclosure();
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [email, setEmail] = useState(''); 

    useEffect(() => {
        close();
    }, [pathname]);

    const isRootPage = pathname === "/";

    useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');

    if (userEmail) {
        const intervalId = setInterval(async () => {
            console.log("Vérification des nouveautés pour :", userEmail);
            try {
                const response = await fetch(`http://localhost:8000/api/notification/${userEmail}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.newUpdates) {
                        console.log("Nouveautés détectées :", data);
                        // Vous pouvez afficher une notification ou mettre à jour l'interface ici
                    } else {
                        console.log("Aucune nouveauté.");
                    }
                } else {
                    console.error("Erreur lors de la récupération des nouveautés.");
                }
            } catch (error) {
                console.error("Erreur réseau :", error);
            }
        }, 3600 * 1000); // 1 heure en millisecondes

        return () => clearInterval(intervalId); // Nettoyage lorsque le composant est démonté
    }
}, []); // Ce useEffect ne dépend que de l'initialisation


  const handleEmailSubmit = async () => {
    console.log("Email submitted:", email);
    const response = await fetch(`http://localhost:8000/api/notification/${email}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    localStorage.setItem('userEmail', email);
    setIsModalOpen(false);
};

    return (
        <AppShell
            header={!isRootPage ? { height: 60 } : undefined}
            navbar={
                !isRootPage
                    ? {
                          width: 300,
                          breakpoint: 'sm',
                          collapsed: { mobile: !opened },
                      }
                    : undefined
            }
            h={"100dvh"}
            style={{ overflow: "auto" }}
            padding={0}
        >
            {!isRootPage && (
                <AppShell.Header p={10} renderRoot={(props) => <Flex align={"center"} {...props} />}>
                    <Group gap={5}>
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                            size="sm"
                        />
                        <img
                            src={scrapperImage.src} 
                            alt="LogoImage"
                            width={50}
                            height={15}
                            style={{ cursor: "pointer" }} 
                        />
                    </Group>
                    <Box flex={1} />
                    <Group gap={10}>
                        <Avatar component="a" href="/account" color="initials" name="User User" />
                        <Anchor
                            c="dark"
                            onClick={() => setIsModalOpen(true)} 
                            style={{ cursor: 'pointer' }} 
                        >
                            <Indicator processing offset={3} size={8}>
                                <IconBellFilled />
                            </Indicator>
                        </Anchor>
                    </Group>
                </AppShell.Header>
            )}

            {!isRootPage && (
                <AppShell.Navbar>
                    {config.navbar.top.map((item, key) => (
                        <MyNavLink key={key} item={item} />
                    ))}
                    <Box flex={1} />
                    {config.navbar.bottom?.map((item, key) => (
                        <MyNavLink key={key} item={item} />
                    ))}
                </AppShell.Navbar>
            )}

            <AppShell.Main h={"100%"} style={{ overflow: "auto" }}>
                {children}
            </AppShell.Main>

            {/* Modal for notifications */}
            <Modal
                opened={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Receive Updates" 
                size="md" 
                centered 
            >
                <Text mb="md">Would you like to receive updates? Enter your email below:</Text>
                <TextInput
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)} 
                    mb="md"
                />
                <Button onClick={handleEmailSubmit} fullWidth>
                    Submit
                </Button>
            </Modal>
        </AppShell>
    );
}