// 'use client'

// import { Anchor, AppShell, Avatar, Box, Burger, Flex, Group, Indicator, NavLink, Text } from "@mantine/core";
// import { forwardRef, PropsWithChildren, useEffect } from "react";
// import { useDisclosure } from "@mantine/hooks";
// import { usePathname } from "next/navigation";
// import { config, NavBarItem } from "@/config";
// import { IconBellFilled, IconChevronRight } from "@tabler/icons-react";
// import Link from "next/link";

// const MyNavLink = forwardRef<HTMLAnchorElement, { item: NavBarItem }>(({ item }, ref) => {
//     const pathname = usePathname();
//     return (
//         <NavLink
//             ref={ref}
//             component={Link}
//             href={item.path}
//             label={item.label}
//             active={pathname == item.path}
//             rightSection={item.withCheveron && (<IconChevronRight size={"1rem"} />)}
//             leftSection={<item.icon size={"1.5rem"} />}
//         />
//     );
// });

// export default function Layout({ children }: PropsWithChildren) {
//     const [opened, { toggle, close }] = useDisclosure();
//     const pathname = usePathname();

//     useEffect(() => {
//         close();
//     }, [pathname]);

//     // Check if the current path is the root page ('/')
//     const isRootPage = pathname === "/";

//     return (
//         <AppShell
//             header={{ height: 60 }}
//             navbar={{
//                 width: 300,
//                 breakpoint: 'sm',
//                 collapsed: { mobile: !opened },
//             }}
//             h={"100dvh"}
//             style={{ overflow: "auto" }}
//             padding={0}
//         >
//             {/* Conditionally render the header content only if it's not the root page */}
//             {!isRootPage && (
//                 <AppShell.Header p={10} renderRoot={(props) => <Flex align={"center"} {...props} />}>
//                     <Group gap={5}>
//                         <Burger
//                             opened={opened}
//                             onClick={toggle}
//                             hiddenFrom="sm"
//                             size="sm"
//                         />
//                         <Text>Logo</Text>
//                     </Group>
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

//             {/* Conditionally render the navbar only if it's not the root page */}
//             {!isRootPage && (
//                 <AppShell.Navbar>
//                     {
//                         config.navbar.top.map((item, key) => (
//                             <MyNavLink key={key} item={item} />
//                         ))
//                     }
//                     <Box flex={1} />
//                     {
//                         config.navbar.bottom?.map((item, key) => (
//                             <MyNavLink key={key} item={item} />
//                         ))
//                     }
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
import { Anchor, AppShell, Avatar, Box, Burger, Flex, Group, Indicator, NavLink, Text } from "@mantine/core";
import { forwardRef, PropsWithChildren, useEffect } from "react";
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

    useEffect(() => {
        close();
    }, [pathname]);

    const isRootPage = pathname === "/";

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
                        <Anchor c="dark" href="/notifications">
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
        </AppShell>
    );
}