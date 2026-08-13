// [ COMPONENTS > MOLECULES > HEADER ] ############################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React, { useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import type { Variants } from 'motion/react';

// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import HamburgerIcon from '../../../assets/icons/HamburgerIcon';
import {
    BrandLockup,
    BrandMark,
    HeaderContainer,
    ListItem,
    ListItemContianer,
    MobileMenuButton,
    MobileMenuItem,
    MobileNavigation,
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
                    <ListItem data-testid="header-pricing" $hideOnMobile>
                        Pricing
                    </ListItem>
                </ListItemContianer>
                <ListItemContianer
                    data-testid="header-account-navigation"
                    $desktopOnly
                >
                    <ListItem data-testid="header-signin">Signin</ListItem>
                    <ListItem data-testid="header-create-account">
                        Create Account
                    </ListItem>
                </ListItemContianer>
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
                            data-testid="header-mobile-pricing"
                            variants={mobileMenuItemVariants}
                        >
                            Pricing
                        </MobileMenuItem>
                        <MobileMenuItem
                            data-testid="header-mobile-signin"
                            variants={mobileMenuItemVariants}
                        >
                            Signin
                        </MobileMenuItem>
                        <MobileMenuItem
                            data-testid="header-mobile-create-account"
                            variants={mobileMenuItemVariants}
                        >
                            Create Account
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
