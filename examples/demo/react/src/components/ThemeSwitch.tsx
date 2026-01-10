import React, { useState } from 'react';
import { Select } from '@tigercat/react';
import { themes, applyTheme } from '../../../shared/themes';

const ThemeSwitch: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState('default');

  const handleThemeChange = (
    value: string | number | (string | number)[] | undefined
  ) => {
    const themeValue = String(value);
    setCurrentTheme(themeValue);
    applyTheme(themeValue);
  };

  const themeOptions = themes.map((t) => ({ label: t.name, value: t.value }));

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0">
        主题：
      </span>
      <Select
        value={currentTheme}
        onChange={handleThemeChange}
        options={themeOptions}
        size="sm"
        className="w-40 max-w-full"
      />
    </div>
  );
};

export default ThemeSwitch;
