// [ COMPONENTS > MOLECULES > HEADER ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React, { useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import type { Variants } from 'motion/react';

// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import HamburgerIcon from '../../../assets/icons/HamburgerIcon';
import { useColorMode } from '../../../theme';
import {
    BrandLockup,
    BrandMark,
    HeaderContainer,
    HeaderLink,
    ListItem,
    ListItemContianer,
    MobileMenuButton,
    MobileMenuItem,
    MobileNavigation,
    ThemeModeThumb,
    ThemeModeToggle,
} from './header.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
const mobileMenuVariants: Variants = {
    closed: {
        transition: { when: 'afterChildren' },
    },
    open: {
        transition: {
            staggerChildren: 0.04,
        },
    },
};

const mobileMenuItemVariants: Variants = {
    closed: { opacity: 0, y: -4 },
    open: {
        opacity: 1,
        y: 0,
        transition: { duration: 2, ease: 'easeOut' },
    },
};
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IHeader {
    title?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const Header: React.FC<IHeader> = () => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { mode, setMode } = useColorMode();

    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    const toggleMobileMenu = () => setIsMobileMenuOpen((isOpen) => !isOpen);

    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................

    return (
        <MotionConfig reducedMotion="user">
            <HeaderContainer data-testid="header">
                <ListItemContianer data-testid="header-primary-navigation">
                    <ListItem
                        data-testid="header-logo"
                        fontWeight="extraBold"
                        fontSize="xl"
                        color="primary"
                    >
                        <BrandLockup>
                            <BrandMark aria-hidden="true" />
                            <span>oto</span>
                        </BrandLockup>
                    </ListItem>
                    <ListItem data-testid="header-about" $hideOnMobile>About</ListItem>
                    <ListItem data-testid="header-methodology" $hideOnMobile>
                        Methodology
                    </ListItem>
                    <ListItem data-testid="header-portfolio" $hideOnMobile>
                        <HeaderLink href="/portfolio">Portfolio</HeaderLink>
                    </ListItem>
                </ListItemContianer>
                <ThemeModeToggle
                    data-testid="header-theme-toggle"
                    type="button"
                    role="switch"
                    aria-checked={mode === 'dark'}
                    aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                    $mode={mode}
                >
                    <ThemeModeThumb $mode={mode}>
                        {mode === 'light' ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M20.6 15.79A9 9 0 0 1 8.21 3.4 9 9 0 1 0 20.6 15.79Z" />
                            </svg>
                        )}
                    </ThemeModeThumb>
                </ThemeModeToggle>
                <MobileMenuButton
                    data-testid="header-menu-toggle"
                    type="button"
                    onClick={toggleMobileMenu}
                    aria-controls="mobile-navigation"
                    aria-expanded={isMobileMenuOpen}
                    aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                >
                    <HamburgerIcon />
                </MobileMenuButton>
            </HeaderContainer>
            <AnimatePresence initial={false}>
                {isMobileMenuOpen && (
                    <MobileNavigation
                        data-testid="header-mobile-navigation"
                        id="mobile-navigation"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={mobileMenuVariants}
                    >
                        <MobileMenuItem
                            data-testid="header-mobile-about"
                            variants={mobileMenuItemVariants}
                        >
                            About
                        </MobileMenuItem>
                        <MobileMenuItem
                            data-testid="header-mobile-methodology"
                            variants={mobileMenuItemVariants}
                        >
                            Methodology
                        </MobileMenuItem>
                        <MobileMenuItem
                            data-testid="header-mobile-portfolio"
                            variants={mobileMenuItemVariants}
                        >
                            <HeaderLink href="/portfolio">Portfolio</HeaderLink>
                        </MobileMenuItem>
                    </MobileNavigation>
                )}
            </AnimatePresence>
        </MotionConfig>
    );

    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default Header;

// END FILE ########################################################################################
