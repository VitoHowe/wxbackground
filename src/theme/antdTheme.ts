import type { ThemeConfig } from 'antd';

// A compact, commercial admin theme: data-dense, high-contrast, and consistent.
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2563EB',
    colorInfo: '#2563EB',
    colorSuccess: '#16A34A',
    colorWarning: '#F59E0B',
    colorError: '#DC2626',

    colorBgLayout: '#F8FAFC',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',

    colorText: '#0F172A',
    colorTextSecondary: '#475569',
    colorBorder: 'rgba(15, 23, 42, 0.12)',
    colorBorderSecondary: 'rgba(15, 23, 42, 0.08)',

    borderRadius: 12,
    borderRadiusLG: 14,

    fontFamily: 'var(--font-app-sans)',
    fontFamilyCode: 'var(--font-app-mono)',

    controlHeight: 40,
    controlHeightLG: 44,
    controlHeightSM: 32,
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'rgba(248, 250, 252, 0.86)',
      siderBg: '#0B1220',
    },
    Menu: {
      itemBorderRadius: 10,
      darkItemBg: '#0B1220',
      darkPopupBg: '#0B1220',
      darkSubMenuItemBg: '#0A0F1A',
      darkItemColor: 'rgba(226, 232, 240, 0.86)',
      darkGroupTitleColor: 'rgba(148, 163, 184, 0.85)',
      darkItemSelectedBg: 'rgba(37, 99, 235, 0.28)',
      darkItemSelectedColor: '#FFFFFF',
      darkItemHoverBg: 'rgba(148, 163, 184, 0.10)',
      darkItemHoverColor: '#FFFFFF',
    },
    Card: {
      paddingLG: 20,
      headerBg: 'transparent',
    },
    Table: {
      headerBg: '#F1F5F9',
      headerSplitColor: 'rgba(15, 23, 42, 0.06)',
      rowHoverBg: '#F8FAFC',
      borderColor: 'rgba(15, 23, 42, 0.08)',
    },
    Button: {
      controlHeight: 40,
      controlHeightLG: 44,
      controlHeightSM: 32,
      borderRadius: 10,
      borderRadiusLG: 12,
      borderRadiusSM: 8,
    },
    Input: {
      controlHeight: 40,
      controlHeightLG: 44,
      controlHeightSM: 32,
      borderRadius: 10,
    },
    Select: {
      controlHeight: 40,
      controlHeightLG: 44,
      controlHeightSM: 32,
      borderRadius: 10,
    },
    Modal: {
      borderRadiusLG: 14,
      titleFontSize: 16,
    },
    Drawer: {
      paddingLG: 20,
    },
    Tag: {
      borderRadiusSM: 999,
      fontSizeSM: 12,
    },
  },
};

