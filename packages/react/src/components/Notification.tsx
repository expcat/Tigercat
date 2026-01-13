import React, { useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  classNames,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  icon24StrokeWidth,
  icon24ViewBox,
  getNotificationTypeClasses,
  defaultNotificationThemeColors,
  notificationContainerBaseClasses,
  notificationPositionClasses,
  notificationBaseClasses,
  notificationIconClasses,
  notificationContentClasses,
  notificationTitleClasses,
  notificationDescriptionClasses,
  notificationCloseButtonClasses,
  notificationCloseIconClasses,
  getNotificationIconPath,
  notificationCloseIconPath,
  type NotificationPosition,
  type NotificationInstance,
  type NotificationOptions,
  type NotificationConfig,
} from '@tigercat/core';

/**
 * Global notification container id prefix
 */
const NOTIFICATION_CONTAINER_ID_PREFIX = 'tiger-notification-container';

/**
 * Notification instance storage per position
 */
const notificationInstancesByPosition: Record<
  NotificationPosition,
  NotificationInstance[]
> = {
  'top-left': [],
  'top-right': [],
  'bottom-left': [],
  'bottom-right': [],
};

let instanceIdCounter = 0;
const containerRoots: Record<NotificationPosition, Root | null> = {
  'top-left': null,
  'top-right': null,
  'bottom-left': null,
  'bottom-right': null,
};
const updateCallbacks: Record<NotificationPosition, (() => void) | null> = {
  'top-left': null,
  'top-right': null,
  'bottom-left': null,
  'bottom-right': null,
};

/**
 * Get next instance id
 */
function getNextInstanceId(): number {
  return ++instanceIdCounter;
}

/**
 * Icon component
 */
const Icon: React.FC<{ path: string; className: string }> = ({
  path,
  className,
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={icon24ViewBox}
      stroke="currentColor"
      strokeWidth={icon24StrokeWidth}
      aria-hidden="true"
      focusable="false">
      <path
        strokeLinecap={icon24PathStrokeLinecap}
        strokeLinejoin={icon24PathStrokeLinejoin}
        d={path}
      />
    </svg>
  );
};

/**
 * Single notification item component
 */
interface NotificationItemProps {
  notification: NotificationInstance;
  onClose: (id: string | number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const colorScheme = getNotificationTypeClasses(
    notification.type,
    defaultNotificationThemeColors
  );

  const notificationClasses = classNames(
    notificationBaseClasses,
    colorScheme.bg,
    colorScheme.border,
    notification.className,
    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
  );

  const iconPath =
    notification.icon || getNotificationIconPath(notification.type);
  const iconClass = classNames(notificationIconClasses, colorScheme.icon);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  const a11yRole = notification.type === 'error' ? 'alert' : 'status';
  const ariaLive = notification.type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      className={notificationClasses}
      role={a11yRole}
      aria-live={ariaLive}
      aria-atomic="true"
      onClick={notification.onClick}
      onKeyDown={(e) => {
        if (!notification.onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          notification.onClick();
        }
      }}
      tabIndex={notification.onClick ? 0 : undefined}
      style={notification.onClick ? { cursor: 'pointer' } : undefined}
      data-tiger-notification=""
      data-tiger-notification-type={notification.type}
      data-tiger-notification-id={String(notification.id)}>
      <Icon path={iconPath} className={iconClass} />
      <div className={notificationContentClasses}>
        <div
          className={classNames(
            notificationTitleClasses,
            colorScheme.titleText
          )}>
          {notification.title}
        </div>
        {notification.description && (
          <div
            className={classNames(
              notificationDescriptionClasses,
              colorScheme.descriptionText
            )}>
            {notification.description}
          </div>
        )}
      </div>
      {notification.closable && (
        <button
          className={notificationCloseButtonClasses}
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          aria-label="Close notification"
          type="button">
          <Icon
            path={notificationCloseIconPath}
            className={notificationCloseIconClasses}
          />
        </button>
      )}
    </div>
  );
};

/**
 * Notification container props
 */
export interface NotificationContainerProps {
  position?: NotificationPosition;
}

/**
 * Notification container component
 */
export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right',
}) => {
  const [notifications, setNotifications] = useState<NotificationInstance[]>(
    []
  );

  useEffect(() => {
    // Register update callback
    updateCallbacks[position] = () => {
      setNotifications([...notificationInstancesByPosition[position]]);
    };

    // Initial sync
    updateCallbacks[position]!();

    return () => {
      updateCallbacks[position] = null;
    };
  }, [position]);

  const containerClasses = classNames(
    notificationContainerBaseClasses,
    notificationPositionClasses[position]
  );

  const handleRemove = (id: string | number) => {
    const instances = notificationInstancesByPosition[position];
    const index = instances.findIndex((notif) => notif.id === id);
    if (index !== -1) {
      const instance = instances[index];
      instances.splice(index, 1);
      if (instance.onClose) {
        instance.onClose();
      }
      updateCallbacks[position]?.();
    }
  };

  return (
    <div
      className={containerClasses}
      id={`${NOTIFICATION_CONTAINER_ID_PREFIX}-${position}`}
      aria-live="polite"
      aria-relevant="additions"
      data-tiger-notification-container=""
      data-tiger-notification-position={position}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={handleRemove}
        />
      ))}
    </div>
  );
};

/**
 * Ensure notification container exists for a position
 */
function ensureContainer(position: NotificationPosition) {
  const containerId = `${NOTIFICATION_CONTAINER_ID_PREFIX}-${position}`;
  const rootId = `${containerId}-root`;

  // If we already created a root but the DOM was externally cleared (e.g. tests), reset.
  const existingRootEl = document.getElementById(rootId);
  if (containerRoots[position] && !existingRootEl) {
    containerRoots[position] = null;
    updateCallbacks[position] = null;
  }

  // If a root already exists for this position, don't recreate it.
  if (containerRoots[position]) {
    return;
  }

  let rootEl = existingRootEl;
  if (!rootEl) {
    rootEl = document.createElement('div');
    rootEl.id = rootId;
    document.body.appendChild(rootEl);
  }

  containerRoots[position] = createRoot(rootEl);
  containerRoots[position]!.render(
    <NotificationContainer position={position} />
  );
}

/**
 * Add a notification to the queue
 */
function addNotification(config: NotificationConfig): () => void {
  const position = config.position || 'top-right';
  ensureContainer(position);

  const id = getNextInstanceId();

  const instance: NotificationInstance = {
    id,
    type: config.type || 'info',
    title: config.title,
    description: config.description,
    duration: config.duration !== undefined ? config.duration : 4500,
    closable: config.closable !== undefined ? config.closable : true,
    onClose: config.onClose,
    onClick: config.onClick,
    icon: config.icon,
    className: config.className,
    position,
  };

  notificationInstancesByPosition[position].push(instance);

  // Trigger update
  if (updateCallbacks[position]) {
    updateCallbacks[position]!();
  }

  // Auto close after duration
  if (instance.duration > 0) {
    setTimeout(() => {
      removeNotification(id, position);
    }, instance.duration);
  }

  // Return close function
  return () => removeNotification(id, position);
}

/**
 * Remove a notification from the queue
 */
function removeNotification(
  id: string | number,
  position: NotificationPosition
) {
  const instances = notificationInstancesByPosition[position];
  const index = instances.findIndex((notif) => notif.id === id);
  if (index !== -1) {
    const instance = instances[index];
    instances.splice(index, 1);
    if (instance.onClose) {
      instance.onClose();
    }
    if (updateCallbacks[position]) {
      updateCallbacks[position]!();
    }
  }
}

/**
 * Clear all notifications for a position or all positions
 */
function clearAll(position?: NotificationPosition) {
  if (position) {
    notificationInstancesByPosition[position].forEach((instance) => {
      if (instance.onClose) {
        instance.onClose();
      }
    });
    notificationInstancesByPosition[position] = [];
    if (updateCallbacks[position]) {
      updateCallbacks[position]!();
    }
  } else {
    // Clear all positions
    Object.keys(notificationInstancesByPosition).forEach((pos) => {
      const p = pos as NotificationPosition;
      notificationInstancesByPosition[p].forEach((instance) => {
        if (instance.onClose) {
          instance.onClose();
        }
      });
      notificationInstancesByPosition[p] = [];
      if (updateCallbacks[p]) {
        updateCallbacks[p]!();
      }
    });
  }
}

/**
 * Normalize notification options
 */
function normalizeOptions(options: NotificationOptions): NotificationConfig {
  if (typeof options === 'string') {
    return { title: options };
  }
  return options;
}

/**
 * Notification API
 */
export const notification = {
  /**
   * Show an info notification
   */
  info(options: NotificationOptions): () => void {
    const config = normalizeOptions(options);
    return addNotification({ ...config, type: 'info' });
  },

  /**
   * Show a success notification
   */
  success(options: NotificationOptions): () => void {
    const config = normalizeOptions(options);
    return addNotification({ ...config, type: 'success' });
  },

  /**
   * Show a warning notification
   */
  warning(options: NotificationOptions): () => void {
    const config = normalizeOptions(options);
    return addNotification({ ...config, type: 'warning' });
  },

  /**
   * Show an error notification
   */
  error(options: NotificationOptions): () => void {
    const config = normalizeOptions(options);
    return addNotification({ ...config, type: 'error' });
  },

  /**
   * Clear all notifications
   */
  clear(position?: NotificationPosition) {
    clearAll(position);
  },
};

export default notification;
