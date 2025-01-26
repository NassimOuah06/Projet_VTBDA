'use client';

import scrapperImage from '../res/scrapper.png';
import profile from '/public/images/trojan.jpg'; 

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

    const handleEmailSubmit = async () => {
        console.log("Email submitted:", email);
        const response = await fetch(`http://localhost:8000/api/notification/${email}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setIsModalOpen(false);
    };

    const handleScrap = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/scrape/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}), 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Scrap API Response:', result);
            alert('Scrap operation completed successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error during scrap operation:', error);
            alert('Failed to perform scrap operation. Please try again.');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/delete/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}), 
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            console.log('Delete API Response:', result);
            alert('Delete operation completed successfully!');
    
            window.location.reload();
        } catch (error) {
            console.error('Error during delete operation:', error);
            alert('Failed to perform delete operation. Please try again.');
        }
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
                        <Button variant="outline" onClick={handleScrap}>
                            Scrap
                        </Button>
                        <Button variant="outline" color="red" onClick={handleDelete}>
                            Delete
                        </Button>
                        <Avatar 
                            component="a" 
                            href="/account" 
                            src={profile.src} // Use .src to access the image URL
                            alt="Profile Picture" 
                        />
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