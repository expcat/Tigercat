export interface TigerLocaleCommon {
  okText?: string;
  cancelText?: string;
  closeText?: string;
  loadingText?: string;
  emptyText?: string;
}

export interface TigerLocaleModal {
  closeAriaLabel?: string;
  okText?: string;
  cancelText?: string;
}

export interface TigerLocaleDrawer {
  closeAriaLabel?: string;
}

export interface TigerLocale {
  common?: TigerLocaleCommon;
  modal?: TigerLocaleModal;
  drawer?: TigerLocaleDrawer;
}
