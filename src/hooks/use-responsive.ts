import { useWindowDimensions, ScaledSize } from 'react-native';

export type ScreenType = 'smallPhone' | 'phone' | 'tablet' | 'desktop' | 'largeDesktop';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isSmallPhone: boolean;   // < 375px (e.g. iPhone SE, small Androids)
  isPhone: boolean;        // < 640px
  isTablet: boolean;       // >= 640px && < 1024px (iPads, Android tablets, landscape phones)
  isDesktop: boolean;      // >= 1024px
  isLargeDesktop: boolean; // >= 1440px
  isLandscape: boolean;
  screenType: ScreenType;

  // Adaptive Container Max-Widths
  containerMaxWidth: number;
  formMaxWidth: number;
  modalMaxWidth: number;
  navbarMaxWidth: number;
  adminContainerMaxWidth: number;

  // Adaptive Paddings & Margins
  paddingHorizontal: number;
  paddingVertical: number;
  gap: number;

  // Grid column helpers
  columns: number;         // 1 for phone, 2 for tablet, 3 for desktop, 4 for large desktop
  docCardWidth: string | number; // percentage or width for multi-column grids
}

/**
 * Universal hook providing dynamic, reactive layout values across all screen sizes:
 * - Small Phones (320px - 374px)
 * - Standard Phones (375px - 639px)
 * - Tablets & Landscape Mobile (640px - 1023px)
 * - Desktops & Laptops (1024px - 1439px)
 * - Large Desktops & Ultrawide (>= 1440px)
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 375;
  const isPhone = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;
  const isLargeDesktop = width >= 1440;
  const isLandscape = width > height;

  let screenType: ScreenType = 'phone';
  if (isSmallPhone) screenType = 'smallPhone';
  else if (isPhone) screenType = 'phone';
  else if (isTablet) screenType = 'tablet';
  else if (isLargeDesktop) screenType = 'largeDesktop';
  else screenType = 'desktop';

  // Responsive container maximum widths
  const containerMaxWidth = isLargeDesktop
    ? 1280
    : isDesktop
    ? 1160
    : isTablet
    ? Math.min(width - 48, 880)
    : Math.min(width, 480);

  const adminContainerMaxWidth = isLargeDesktop
    ? 1320
    : isDesktop
    ? 1200
    : isTablet
    ? Math.min(width - 48, 920)
    : Math.min(width, 720);

  const formMaxWidth = isDesktop ? 840 : isTablet ? 700 : Math.min(width - 32, 460);
  const modalMaxWidth = isDesktop ? 680 : isTablet ? 600 : Math.min(width - 32, 420);
  const navbarMaxWidth = isDesktop ? 760 : isTablet ? 640 : 480;

  // Responsive padding
  const paddingHorizontal = isSmallPhone ? 12 : isPhone ? 16 : isTablet ? 24 : 32;
  const paddingVertical = isSmallPhone ? 12 : isPhone ? 16 : 24;
  const gap = isSmallPhone ? 8 : isPhone ? 12 : isTablet ? 16 : 20;

  // Grid columns for cards
  const columns = isLargeDesktop ? 4 : isDesktop ? 3 : isTablet ? 2 : 1;
  const docCardWidth = isDesktop ? '31.5%' : isTablet ? '48.5%' : '100%';

  return {
    width,
    height,
    isSmallPhone,
    isPhone,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isLandscape,
    screenType,
    containerMaxWidth,
    adminContainerMaxWidth,
    formMaxWidth,
    modalMaxWidth,
    navbarMaxWidth,
    paddingHorizontal,
    paddingVertical,
    gap,
    columns,
    docCardWidth,
  };
}
