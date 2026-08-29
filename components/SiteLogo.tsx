function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      className="logo-mark"
      focusable="false"
      viewBox="0 0 48 48"
    >
      <path
        className="logo-part logo-signature"
        d="M10 14c8-6 19-7 26-4-5 6-16 11-22 18-2 3 0 5 4 3 8-3 15-7 20-4 3 1 4 4 0 6"
      />
      <circle className="logo-dot" cx="34" cy="24" r="2.5" />
    </svg>
  );
}

export function SiteLogo() {
  return (
    <span className="site-logo">
      <span className="site-logo-tile">
        <LogoMark />
      </span>
    </span>
  );
}
