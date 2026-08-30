export function ThemeToggle() {
  return (
    <button
      aria-label="切换明暗主题"
      className="theme-toggle"
      title="切换明暗主题"
      type="button"
    >
      <svg aria-hidden="true" className="theme-icon theme-icon-sun" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
      </svg>
      <svg aria-hidden="true" className="theme-icon theme-icon-moon" viewBox="0 0 24 24">
        <path d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6 8.5 8.5 0 1 0 20.4 15.2Z" />
      </svg>
    </button>
  );
}
