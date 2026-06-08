import { describe, expect, it } from "vitest";

import {
  getPosterImageSize,
  getPosterParams,
  getTeamFlagEmoji,
  getTeamFlagSrc,
  posterLayoutStyles,
  posterWatermarkText,
  teamCountryCodes,
} from "./poster";

describe("getPosterParams", () => {
  it("reads the standardized poster search params", () => {
    const request = new Request(
      "https://getgamedaykit.com/api/og?teamA=Argentina&teamB=Brazil&offer=%245%20Pints&venueName=Corner%20Pub&date=12%20JUN%202026&time=03%3A00&bgUrl=%2Fimages%2Fbg-neon-bar.jpg&isVip=false",
    );

    expect(getPosterParams(request)).toEqual({
      teamA: "Argentina",
      teamB: "Brazil",
      offerText: "$5 Pints",
      venueName: "Corner Pub",
      matchDate: "12 JUN 2026",
      kickoffTime: "03:00",
      bgUrl: "https://getgamedaykit.com/images/bg-neon-bar.jpg",
      showWatermark: true,
    });
  });

  it("defaults missing display params and limits visual text fields", () => {
    const request = new Request(
      `https://getgamedaykit.com/api/og?teamA=&offer=${"A".repeat(60)}&venueName=${"B".repeat(60)}`,
    );

    expect(getPosterParams(request)).toEqual({
      teamA: "Team A",
      teamB: "Team B",
      offerText: "A".repeat(40),
      venueName: "B".repeat(40),
      matchDate: "MATCH DATE",
      kickoffTime: "--:--",
      bgUrl: "https://getgamedaykit.com/images/bg-stadium-crowd.jpg",
      showWatermark: true,
    });
  });

  it("hides the watermark when isVip is true", () => {
    const request = new Request(
      "https://getgamedaykit.com/api/og?teamA=France&teamB=Japan&isVip=true",
    );

    expect(getPosterParams(request).showWatermark).toBe(false);
  });
});

describe("poster layout", () => {
  it("uses a strict 16:9 poster canvas", () => {
    expect(getPosterImageSize()).toEqual({
      width: 1200,
      height: 675,
    });
  });

  it("maps team names to open-source flag CDN URLs", () => {
    expect(teamCountryCodes["United States"]).toBe("US");
    expect(teamCountryCodes["England"]).toBe("GB");
    expect(teamCountryCodes["Korea Republic"]).toBe("KR");
    expect(teamCountryCodes["Côte d’Ivoire"]).toBe("CI");
    expect(teamCountryCodes["Türkiye"]).toBe("TR");
    expect(getTeamFlagSrc("Mexico")).toBe(
      "https://purecatamphetamine.github.io/country-flag-icons/1x1/MX.svg",
    );
    expect(getTeamFlagEmoji("Mexico")).toBe("🇲🇽");
    expect(getTeamFlagSrc("Team A")).toBeNull();
    expect(getTeamFlagEmoji("Team A")).toBeNull();
  });

  it("uses a single fixed scoreboard layout", () => {
    const dateToScoreboardGap =
      Number(posterLayoutStyles.scoreboard.top) -
      Number(posterLayoutStyles.matchDate.top) -
      Number(posterLayoutStyles.matchDate.fontSize);

    expect(dateToScoreboardGap).toBe(48);
    expect(posterLayoutStyles.offer.marginTop).toBe(48);
    expect(posterLayoutStyles.scoreboard.top).toBe(230);
    expect(posterLayoutStyles.scoreboard.flexDirection).toBe("row");
    expect(posterLayoutStyles.scoreboard.gap).toBe(28);
    expect(posterLayoutStyles.teamFlagGap.gap).toBe(18);
    expect(posterLayoutStyles.teamGroup.width).toBe(430);
    expect(posterLayoutStyles.teamGroupLeft.justifyContent).toBe("flex-end");
    expect(posterLayoutStyles.teamGroupRight.justifyContent).toBe("flex-start");
    expect(posterLayoutStyles.kickoffTime.width).toBeUndefined();
    expect(posterLayoutStyles.flag.width).toBe(58);
    expect(posterLayoutStyles.teamName.whiteSpace).toBe("nowrap");
    expect(posterLayoutStyles.teamName.textShadow).toBe(
      "0 2px 4px rgba(0,0,0,0.8)",
    );
    expect(posterLayoutStyles.offer.fontSize).toBe(72);
  });

  it("uses the 2026 World Cup footer watermark text", () => {
    expect(posterWatermarkText).toBe(
      "⚽ getgamedaykit.com • 2026 World Cup Edition",
    );
  });
});
