'use client';

import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';

export function useThemeUtils() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark =
    mounted && (theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'));

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  return { isDark, toggleTheme, mounted };
}
