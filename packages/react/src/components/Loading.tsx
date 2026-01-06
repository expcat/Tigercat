import React, { useEffect, useState, useMemo } from 'react';
import {
  classNames,
  getLoadingClasses,
  getSpinnerSVG,
  dotsVariantConfig,
  barsVariantConfig,
  loadingContainerBaseClasses,
  loadingFullscreenBaseClasses,
  loadingTextSizeClasses,
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

  const spinnerClasses = useMemo(() => {
    return getLoadingClasses(variant, size, color, customColor);
  }, [variant, size, color, customColor]);

  const textClasses = useMemo(() => {
    return classNames(
      loadingTextSizeClasses[size],
      customColor ? '' : loadingColorClasses[color],
      'font-medium'
    );
  }, [size, color, customColor]);

  const containerClasses = useMemo(() => {
    if (fullscreen) {
      return classNames(loadingFullscreenBaseClasses, className);
    }
    return classNames(loadingContainerBaseClasses, className);
  }, [fullscreen, className]);

  const customStyle = useMemo(() => {
    const style: React.CSSProperties = {};
    if (customColor) {
      style.color = customColor;
    }
    if (fullscreen) {
      style.backgroundColor = background;
    }
    return style;
  }, [customColor, fullscreen, background]);

  // Render spinner variant
  const renderSpinner = () => {
    const svg = getSpinnerSVG(variant);

    return (
      <svg
        className={spinnerClasses}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox={svg.viewBox}
        style={customColor ? { color: customColor } : undefined}>
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
    const config = dotsVariantConfig[size];
    const colorClass = customColor ? '' : loadingColorClasses[color];

    return (
      <div className={classNames('flex items-center', config.gap)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={classNames(
              config.dotSize,
              'rounded-full',
              'bg-current',
              colorClass,
              'animate-bounce-dot',
              i === 0
                ? 'animation-delay-0'
                : i === 1
                ? 'animation-delay-150'
                : 'animation-delay-300'
            )}
            style={customColor ? { backgroundColor: customColor } : undefined}
          />
        ))}
      </div>
    );
  };

  // Render bars variant
  const renderBars = () => {
    const config = barsVariantConfig[size];
    const colorClass = customColor ? '' : loadingColorClasses[color];

    return (
      <div className={classNames('flex items-end', config.gap)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={classNames(
              config.barWidth,
              config.barHeight,
              'rounded-sm',
              'bg-current',
              colorClass,
              'animate-scale-bar',
              i === 0
                ? 'animation-delay-0'
                : i === 1
                ? 'animation-delay-150'
                : 'animation-delay-300'
            )}
            style={customColor ? { backgroundColor: customColor } : undefined}
          />
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
      style={customStyle}
      role="status"
      aria-label={text || 'Loading'}
      aria-live="polite"
      {...props}>
      {renderIndicator()}
      {text && <div className={textClasses}>{text}</div>}
    </div>
  );
};
