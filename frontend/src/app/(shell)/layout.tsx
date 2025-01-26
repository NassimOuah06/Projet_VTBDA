// 'use client';
// import scrapperImage from '../res/scrapper.png';
// import { Anchor, AppShell, Avatar, Box, Burger, Flex, Group, Indicator, NavLink, Text } from "@mantine/core";
// import { forwardRef, PropsWithChildren, useEffect } from "react";
// import { useDisclosure } from "@mantine/hooks";
// import { usePathname } from "next/navigation";
// import { config, NavBarItem } from "@/config";
// import { IconBellFilled, IconChevronRight } from "@tabler/icons-react";
// import Link from "next/link";

// const MyNavLink = forwardRef<HTMLAnchorElement, { item: NavBarItem }>(({ item }, ref) => {
//     const pathname = usePathname();
//     return item.disabled ? (
//         <NavLink
//             component="div" 
//             label={item.label}
//             active={pathname === item.path}
//             rightSection={item.withCheveron && (<IconChevronRight size={"1rem"} />)}
//             leftSection={<item.icon size={"1.5rem"} />}
//             disabled={item.disabled}
//             style={{ cursor: "not-allowed" }} 
//         />
//     ) : (
//         <NavLink
//             component={Link}
//             href={item.path}
//             ref={ref}
//             label={item.label}
//             active={pathname === item.path}
//             rightSection={item.withCheveron && (<IconChevronRight size={"1rem"} />)}
//             leftSection={<item.icon size={"1.5rem"} />}
//             style={{ cursor: "pointer" }} // Change cursor for enabled items
//         />
//     );
// });

// export default function Layout({ children }: PropsWithChildren) {
//     const [opened, { toggle, close }] = useDisclosure();
//     const pathname = usePathname();

//     useEffect(() => {
//         close();
//     }, [pathname]);

//     const isRootPage = pathname === "/";

//     return (
//         <AppShell

//         header={!isRootPage ? { height: 60 } : undefined}
//             navbar={
//                 !isRootPage
//                     ? {
//                           width: 300,
//                           breakpoint: 'sm',
//                           collapsed: { mobile: !opened },
//                       }
//                     : undefined
//             }
//             h={"100dvh"}
//             style={{ overflow: "auto" }}
//             padding={0}
//         >
//             {!isRootPage && (
//                 <AppShell.Header p={10} renderRoot={(props) => <Flex align={"center"} {...props} />}>
                    
//                     <Group gap={5}>
//     <Burger
//         opened={opened}
//         onClick={toggle}
//         hiddenFrom="sm"
//         size="sm"
//     />
//     <img
//         src={scrapperImage.src} 
//         alt="LogoImage"
//         width={50}
//         height={15}
//         style={{ cursor: "pointer" }} 
//     />
// </Group>
                
//                     <Box flex={1} />
//                     <Group gap={10}>
//                         <Avatar component="a" href="/account" color="initials" name="User User" />
//                         <Anchor c="dark" href="/notifications">
//                             <Indicator processing offset={3} size={8}>
//                                 <IconBellFilled />
//                             </Indicator>
//                         </Anchor>
//                     </Group>
//                 </AppShell.Header>
//             )}

//             {!isRootPage && (
//                 <AppShell.Navbar>
//                     {config.navbar.top.map((item, key) => (
//                         <MyNavLink key={key} item={item} />
//                     ))}
//                     <Box flex={1} />
//                     {config.navbar.bottom?.map((item, key) => (
//                         <MyNavLink key={key} item={item} />
//                     ))}
//                 </AppShell.Navbar>
//             )}

//             <AppShell.Main h={"100%"} style={{ overflow: "auto" }}>
//                 {children}
//             </AppShell.Main>
//         </AppShell>
//     );
// }

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
            style={{ cursor: "pointer" }} // Change cursor for enabled items
        />
    );
});

export default function Layout({ children }: PropsWithChildren) {
    const [opened, { toggle, close }] = useDisclosure();
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [email, setEmail] = useState(''); // State to store the user's email input

    useEffect(() => {
        close();
    }, [pathname]);

    const isRootPage = pathname === "/";

    // Function to handle email submission
    const handleEmailSubmit = () => {
        console.log("Email submitted:", email);
        // Add your logic here to handle the email submission (e.g., send to an API)
        setIsModalOpen(false); // Close the modal after submission
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
                        {/* Notification bell with a click handler to open the modal */}
                        <Anchor
                            c="dark"
                            onClick={() => setIsModalOpen(true)} // Open modal on click
                            style={{ cursor: 'pointer' }} // Change cursor to pointer to indicate clickability
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