import '@/styles/globals.css'
import '@mantine/core/styles.css';

import { ColorSchemeScript } from '@mantine/core';
import { PropsWithChildren } from 'react';
import NextTopLoader from 'nextjs-toploader';
import Providers from './providers';

export default function MainLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ColorSchemeScript />
            </head>
            <body suppressHydrationWarning>
                <NextTopLoader
                    showSpinner={false}    
                    />
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
