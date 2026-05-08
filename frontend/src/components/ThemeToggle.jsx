import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ collapsed }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (collapsed) {
    return (
      <button 
        className="nav-icon-btn"
        style={{ margin: '0 auto', background: 'transparent', width: 36, height: 36 }}
        onClick={toggleTheme}
        title="Toggle Theme"
      >
        {isDark ? '🌙' : '☀️'}
      </button>
    );
  }

  return (
    <button 
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`} 
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
}
