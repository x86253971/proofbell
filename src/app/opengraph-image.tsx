import { ImageResponse } from "next/og";

export const alt = "ProofBell — Social proof widget for indie SaaS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse (satori) supports inline style objects + basic SVG, not Tailwind.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      {/* Bell mark on a white tile, matching the in-widget dot */}
      <div
        style={{
          display: "flex",
          width: 120,
          height: 120,
          borderRadius: 28,
          background: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="68"
          height="68"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 42,
          fontWeight: 600,
          marginTop: 40,
          color: "#eef2ff",
        }}
      >
        ProofBell
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 74,
          fontWeight: 700,
          lineHeight: 1.12,
          marginTop: 14,
          maxWidth: 1000,
        }}
      >
        Social proof for indie SaaS
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 34,
          color: "#fce7f3",
          marginTop: 28,
        }}
      >
        Connect Stripe, show live activity — $49 lifetime, no monthly fees
      </div>
    </div>,
    size,
  );
}
