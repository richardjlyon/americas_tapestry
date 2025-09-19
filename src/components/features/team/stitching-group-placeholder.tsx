export function StitchingGroupPlaceholder() {
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      {/* Background color */}
      <rect width="100%" height="100%" fill="#f8f5ee" />

      {/* Horizontal threads in subtle colors */}
      <pattern
        id="threadTexture"
        patternUnits="userSpaceOnUse"
        width="5"
        height="5"
      >
        <rect width="5" height="5" fill="#f8f5ee" />
        <line
          x1="0"
          y1="2.5"
          x2="5"
          y2="2.5"
          stroke="#ebe6da"
          strokeWidth="1"
        />
      </pattern>

      <rect width="100%" height="100%" fill="url(#threadTexture)" />

      {/* Thread spools as decorative elements */}
      <g transform="translate(200,150)">
        <rect
          x="-15"
          y="-30"
          width="30"
          height="60"
          rx="2"
          ry="2"
          fill="#d8d3c6"
        />
        <rect
          x="-20"
          y="-35"
          width="40"
          height="5"
          rx="1"
          ry="1"
          fill="#b5ad9c"
        />
        <rect
          x="-20"
          y="30"
          width="40"
          height="5"
          rx="1"
          ry="1"
          fill="#b5ad9c"
        />
        {/* Thread wound around spool */}
        <rect
          x="-15"
          y="-25"
          width="30"
          height="50"
          rx="1"
          ry="1"
          fill="#cdc7b8"
        />
      </g>

      {/* Thread coming off spool */}
      <path
        d="M200,120 C240,105 260,155 280,135 C300,115 310,175 350,165"
        fill="none"
        stroke="#cdc7b8"
        strokeWidth="2"
      />
    </svg>
  );
}
