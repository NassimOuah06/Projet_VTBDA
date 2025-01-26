import { Icon, IconChevronRight, IconFileArrowRight, IconFileInfo, IconHome, IconMessage, IconProps, IconZoomScan } from '@tabler/icons-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

export type NavBarItem = {
    label: string,
    path: string,
    // icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>,
    icon: any,
    withCheveron?: boolean,
    disabled?: boolean;
}

type ConfigType = {
    navbar: {
        top: NavBarItem[],
        bottom?: NavBarItem[]
    }
}

export const config: ConfigType = {
    navbar: {
        top: [
            {
                label: "Information",
                path: '/information',
                icon: IconFileInfo,
                withCheveron: true
                
            },
            {
                label: "Analyse",
                path: '/analyse',
                icon: IconZoomScan,
                withCheveron: true,
                disabled: true
            },
            {
                label: "Finalisation", 
                path: '/finalization',
                icon: IconFileArrowRight,
                withCheveron: true,
                disabled: true
            },
        ],
        bottom: [
            {
                label: "FAQ",
                path: '/faq',
                icon: IconMessage,
                withCheveron: true
            },
            {
                label: "Graphs",
                path: '/graphs',
                icon: IconMessage,
                withCheveron: true
            }
        ]
    },
}