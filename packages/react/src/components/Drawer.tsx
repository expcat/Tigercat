import React, { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  classNames,
  getDrawerMaskClasses,
  getDrawerContainerClasses,
  getDrawerPanelClasses,
  getDrawerHeaderClasses,
  getDrawerBodyClasses,
  getDrawerFooterClasses,
  getDrawerCloseButtonClasses,
  getDrawerTitleClasses,
  type DrawerProps as CoreDrawerProps,
} from "@tigercat/core";

export interface DrawerProps
  extends CoreDrawerProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  onClose?: () => void;
  onAfterEnter?: () => void;
  onAfterLeave?: () => void;
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;

  /**
   * Close button aria-label
   * @default 'Close drawer'
   */
  closeAriaLabel?: string;
}

const CloseIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const Drawer: React.FC<DrawerProps> = ({
  visible = false,
  placement = "right",
  size = "md",
  title,
  header,
  closable = true,
  mask = true,
  maskClosable = true,
  zIndex = 1000,
  className,
  bodyClassName,
  destroyOnClose = false,
  onClose,
  onAfterEnter,
  onAfterLeave,
  closeAriaLabel = "Close drawer",
  children,
  footer,
  style,
  ...rest
}) => {
  const [hasBeenOpened, setHasBeenOpened] = React.useState(visible);

  useEffect(() => {
    if (visible) setHasBeenOpened(true);
  }, [visible]);

  const shouldRender = destroyOnClose ? visible : hasBeenOpened;

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleMaskClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!maskClosable) return;
      if (event.target === event.currentTarget) {
        handleClose();
      }
    },
    [maskClosable, handleClose]
  );

  useEffect(() => {
    if (!visible) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [visible, handleClose]);

  const previousVisible = useRef(false);
  useEffect(() => {
    if (visible === previousVisible.current) return;
    previousVisible.current = visible;

    const timer = window.setTimeout(() => {
      if (visible) {
        onAfterEnter?.();
      } else {
        onAfterLeave?.();
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [visible, onAfterEnter, onAfterLeave]);

  const reactId = useId();
  const drawerId = useMemo(() => `tiger-drawer-${reactId}`, [reactId]);
  const titleId = `${drawerId}-title`;

  const {
    ["aria-labelledby"]: _ariaLabelledby,
    role: _role,
    tabIndex: _tabIndex,
    ...dialogDivProps
  } = rest as React.HTMLAttributes<HTMLDivElement> & React.AriaAttributes;

  const ariaLabelledby =
    (rest as React.AriaAttributes)["aria-labelledby"] ??
    (title || header ? titleId : undefined);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!visible) return;

    const active = document.activeElement;
    previousActiveElementRef.current =
      active instanceof HTMLElement ? active : null;

    const timer = window.setTimeout(() => {
      const el = closeButtonRef.current ?? dialogRef.current;
      el?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    if (visible) return;
    previousActiveElementRef.current?.focus?.();
  }, [visible]);

  const containerClasses = classNames(
    getDrawerContainerClasses(zIndex),
    !visible && "pointer-events-none"
  );

  const maskClasses = getDrawerMaskClasses(visible);
  const panelClasses = classNames(
    getDrawerPanelClasses(placement, visible, size),
    "flex flex-col",
    className
  );

  const headerClasses = getDrawerHeaderClasses();
  const bodyClasses = getDrawerBodyClasses(bodyClassName);
  const footerClasses = getDrawerFooterClasses();
  const closeButtonClasses = getDrawerCloseButtonClasses();
  const titleClasses = getDrawerTitleClasses();

  if (!shouldRender) {
    return null;
  }

  const drawerContent = (
    <div
      className={containerClasses}
      style={{ zIndex }}
      hidden={!visible}
      aria-hidden={!visible ? "true" : undefined}
      data-tiger-drawer-root=""
    >
      {mask && (
        <div
          className={maskClasses}
          onClick={handleMaskClick}
          aria-hidden="true"
          data-tiger-drawer-mask=""
        />
      )}

      <div
        className={panelClasses}
        style={style}
        {...dialogDivProps}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
        tabIndex={-1}
        ref={dialogRef}
        data-tiger-drawer=""
      >
        {(title || header || closable) && (
          <div className={headerClasses}>
            {(title || header) && (
              <h3 className={titleClasses} id={titleId}>
                {header || title}
              </h3>
            )}
            {closable && (
              <button
                type="button"
                className={closeButtonClasses}
                onClick={handleClose}
                aria-label={closeAriaLabel}
                ref={closeButtonRef}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {children && <div className={bodyClasses}>{children}</div>}
        {footer && <div className={footerClasses}>{footer}</div>}
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(drawerContent, document.body);
};
