import type { CSSProperties, ReactElement } from "react";

import {
  getTeamFlagEmoji,
  getTeamFlagSrc,
  teamCountryCodes,
} from "../../../lib/team-flags";

const posterImageSize = {
  width: 1200,
  height: 675,
};

const maxOfferLength = 40;
const maxVenueLength = 40;
const defaultBackgroundPath = "/images/bg-stadium-crowd.jpg";

export const posterWatermarkText = "⚽ getgamedaykit.com • 2026 World Cup Edition";

export { getTeamFlagEmoji, getTeamFlagSrc, teamCountryCodes };

export type PosterMode = "business" | "creator";
export type PosterStyle = "neon" | "retro" | "grid";

export type PosterParams = {
  teamA: string;
  teamB: string;
  offerText: string;
  venueName: string;
  matchDate: string;
  kickoffTime: string;
  bgUrl: string;
  showWatermark: boolean;
};

export function getPosterImageSize() {
  return posterImageSize;
}

export function getPosterParams(request: Request): PosterParams {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  return {
    teamA: getPosterText(searchParams.get("teamA"), "Team A"),
    teamB: getPosterText(searchParams.get("teamB"), "Team B"),
    offerText: getPosterText(searchParams.get("offer"), "").slice(
      0,
      maxOfferLength,
    ),
    venueName: getPosterText(searchParams.get("venueName"), "").slice(
      0,
      maxVenueLength,
    ),
    matchDate: getPosterText(
      searchParams.get("date") ?? searchParams.get("matchDate"),
      "MATCH DATE",
    ),
    kickoffTime: getPosterText(
      searchParams.get("time") ?? searchParams.get("kickoffTime"),
      "--:--",
    ),
    bgUrl: getBackgroundUrl(searchParams.get("bgUrl"), url.origin),
    showWatermark: searchParams.get("isVip") !== "true",
  };
}

function getPosterText(value: string | null, fallback: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : fallback;
}

function getBackgroundUrl(value: string | null, origin: string) {
  const bgUrl = getPosterText(value, defaultBackgroundPath);

  if (bgUrl.startsWith("http://") || bgUrl.startsWith("https://")) {
    return bgUrl;
  }

  if (bgUrl.startsWith("/")) {
    return `${origin}${bgUrl}`;
  }

  return `${origin}/${bgUrl}`;
}

export function PosterImage(posterParams: PosterParams): ReactElement {
  return (
    <div
      style={{
        ...posterLayoutStyles.canvas,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0.68)), url(${posterParams.bgUrl})`,
      }}
    >
      <div style={posterLayoutStyles.matchDate}>{posterParams.matchDate}</div>

      <div style={posterLayoutStyles.scoreboard}>
        <div
          style={{
            ...posterLayoutStyles.teamGroup,
            ...posterLayoutStyles.teamGroupLeft,
          }}
        >
          <div style={posterLayoutStyles.teamName}>{posterParams.teamA}</div>
          <FlagBadge teamName={posterParams.teamA} />
        </div>
        <div style={posterLayoutStyles.kickoffTime}>
          {posterParams.kickoffTime}
        </div>
        <div
          style={{
            ...posterLayoutStyles.teamGroup,
            ...posterLayoutStyles.teamGroupRight,
          }}
        >
          <FlagBadge teamName={posterParams.teamB} />
          <div style={posterLayoutStyles.teamName}>{posterParams.teamB}</div>
        </div>
      </div>

      <div style={posterLayoutStyles.bottomContent}>
        <div style={posterLayoutStyles.venue}>
          {posterParams.venueName || "ROOM BY LE KIEF"}
        </div>
        <div style={posterLayoutStyles.offer}>
          {posterParams.offerText || "$5 PINTS DURING THE GAME"}
        </div>
      </div>

      <Watermark showWatermark={posterParams.showWatermark} />
    </div>
  );
}

function FlagBadge({ teamName }: { teamName: string }): ReactElement | null {
  const flagEmoji = getTeamFlagEmoji(teamName);

  if (!flagEmoji) {
    return null;
  }

  return (
    <div style={posterLayoutStyles.flagBadge}>
      <div style={posterLayoutStyles.flag}>{flagEmoji}</div>
    </div>
  );
}

function Watermark({
  showWatermark,
}: {
  showWatermark: boolean;
}): ReactElement | null {
  if (!showWatermark) {
    return null;
  }

  return <div style={posterLayoutStyles.watermark}>{posterWatermarkText}</div>;
}

const baseText: CSSProperties = {
  display: "flex",
  boxSizing: "border-box",
  letterSpacing: 0,
};

const legibleTextShadow = "0 2px 4px rgba(0,0,0,0.8)";

export const posterLayoutStyles: Record<string, CSSProperties> = {
  canvas: {
    ...baseText,
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#FFFFFF",
    fontFamily: "Arial Black, Arial, Helvetica, sans-serif",
  },
  matchDate: {
    ...baseText,
    position: "absolute",
    top: 154,
    left: 0,
    right: 0,
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: 800,
    textShadow: legibleTextShadow,
    textTransform: "uppercase",
  },
  scoreboard: {
    ...baseText,
    position: "absolute",
    top: 230,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  teamFlagGap: {
    gap: 18,
  },
  teamGroup: {
    ...baseText,
    width: 430,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  teamGroupLeft: {
    justifyContent: "flex-end",
  },
  teamGroupRight: {
    justifyContent: "flex-start",
  },
  teamName: {
    ...baseText,
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: 900,
    lineHeight: 1,
    textAlign: "center",
    textShadow: legibleTextShadow,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  flagBadge: {
    ...baseText,
    width: 70,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 4,
    boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  flag: {
    ...baseText,
    width: 58,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
  },
  kickoffTime: {
    ...baseText,
    flexShrink: 0,
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 50,
    fontWeight: 900,
    lineHeight: 1,
    textAlign: "center",
    textShadow: legibleTextShadow,
  },
  bottomContent: {
    ...baseText,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 78,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  venue: {
    ...baseText,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: 900,
    textAlign: "center",
    textShadow: legibleTextShadow,
    textTransform: "uppercase",
  },
  offer: {
    ...baseText,
    marginTop: 48,
    color: "#FFFFFF",
    fontSize: 72,
    fontWeight: 900,
    lineHeight: 1,
    textAlign: "center",
    textShadow: legibleTextShadow,
    textTransform: "uppercase",
  },
  watermark: {
    ...baseText,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#FFFFFF",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 18,
    fontWeight: 700,
  },
};
