export default function VeritasLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield outline */}
      <path
        d="M24 4L6 12V26C6 36 14 43 24 46C34 43 42 36 42 26V12L24 4Z"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Checkmark */}
      <path
        d="M15 24L21 30L33 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* VERITAS text */}
      <text
        x="24"
        y="42"
        textAnchor="middle"
        fontSize="5"
        fill="white"
        fontFamily="serif"
        letterSpacing="1"
      >
        VERITAS
      </text>
    </svg>
  );
}
