import { ImageResponse } from "next/og";

export const alt =
  "GameDayKit World Cup 2026 poster and caption generator for venues";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at 12% 12%, rgba(50,245,200,0.22), transparent 330px), radial-gradient(circle at 84% 8%, rgba(248,231,28,0.18), transparent 300px), #070a0f",
          color: "#f8fafc",
          padding: 64,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 86,
              height: 86,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              background: "#f8e71c",
              color: "#111827",
              fontSize: 40,
              fontWeight: 900,
            }}
          >
            G
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ color: "#32f5c8", fontSize: 26, fontWeight: 900 }}>
              GAMEDAYKIT
            </div>
            <div style={{ color: "#9ca3af", fontSize: 22 }}>
              World Cup 2026 venue kit
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              maxWidth: 940,
              fontSize: 78,
              lineHeight: 0.94,
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            Matchday posters and social captions for venues.
          </div>
          <div style={{ maxWidth: 790, color: "#cbd5e1", fontSize: 30 }}>
            Pick an official fixture, add your offer, preview the poster, then
            generate ready-to-share promo copy.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #263241",
            paddingTop: 26,
            color: "#9ca3af",
            fontSize: 24,
          }}
        >
          <div>getgamedaykit.com</div>
          <div style={{ color: "#f8e71c", fontWeight: 900 }}>
            Preview first. Generate when ready.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
