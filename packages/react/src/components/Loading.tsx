import React, { useEffect, useState } from 'react';
import {
  classNames,
  getLoadingBarClasses,
  getLoadingBarsWrapperClasses,
  getLoadingClasses,
  getLoadingDotClasses,
  getLoadingDotsWrapperClasses,
  getLoadingTextClasses,
  getSpinnerSVG,
  loadingContainerBaseClasses,
  loadingFullscreenBaseClasses,
  loadingColorClasses,
  injectLoadingAnimationStyles,
  type LoadingProps as CoreLoadingProps,
} from '@tigercat/core';

export interface LoadingProps
  extends CoreLoadingProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreLoadingProps> {}

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  fullscreen = false,
  delay = 0,
  background = 'rgba(255, 255, 255, 0.9)',
  customColor,
  className = '',
  style,
  ...props
}) => {
  // Inject animation styles when component is first used
  useEffect(() => {
    injectLoadingAnimationStyles();
  }, []);

  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  const spinnerClasses = getLoadingClasses(variant, size, color, customColor);
  const textClasses = getLoadingTextClasses(size, color, customColor);

  const containerClasses = classNames(
    fullscreen ? loadingFullscreenBaseClasses : loadingContainerBaseClasses,
    className
  );

  const mergedStyle: React.CSSProperties = {
    ...(customColor ? { color: customColor } : null),
    ...(fullscreen ? { backgroundColor: background } : null),
    ...style,
  };

  // Render spinner variant
  const renderSpinner = () => {
    const svg = getSpinnerSVG(variant);

    return (
      <svg
        className={spinnerClasses}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox={svg.viewBox}>
        {svg.elements.map((el, index) => {
          if (el.type === 'circle') {
            return <circle key={index} {...el.attrs} />;
          } else if (el.type === 'path') {
            return <path key={index} {...el.attrs} />;
          }
          return null;
        })}
      </svg>
    );
  };

  // Render dots variant
  const renderDots = () => {
    const colorClass = customColor ? '' : loadingColorClasses[color];
    const steps = [0, 1, 2] as const;

    return (
      <div className={getLoadingDotsWrapperClasses(size)}>
        {steps.map((i) => (
          <div key={i} className={getLoadingDotClasses(size, i, colorClass)} />
        ))}
      </div>
    );
  };

  // Render bars variant
  const renderBars = () => {
    const colorClass = customColor ? '' : loadingColorClasses[color];
    const steps = [0, 1, 2] as const;

    return (
      <div className={getLoadingBarsWrapperClasses(size)}>
        {steps.map((i) => (
          <div key={i} className={getLoadingBarClasses(size, i, colorClass)} />
        ))}
      </div>
    );
  };

  // Render loading indicator based on variant
  const renderIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'bars':
        return renderBars();
      case 'spinner':
      case 'ring':
      case 'pulse':
      default:
        return renderSpinner();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className={containerClasses}
      style={mergedStyle}
      role="status"
      aria-label={text || 'Loading'}
      aria-live="polite"
      aria-busy={true}
      {...props}>
      {renderIndicator()}
      {text && <div className={textClasses}>{text}</div>}
    </div>
  );
};
