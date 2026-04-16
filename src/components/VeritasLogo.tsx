export default function VeritasLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Veritas Consulting Partners"
    >
      <path
        d="M24 4L6 12V26C6 36 14 43 24 46C34 43 42 36 42 26V12L24 4Z"
        stroke="#B8952A"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M15 24L21 30L33 18"
        stroke="#B8952A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
