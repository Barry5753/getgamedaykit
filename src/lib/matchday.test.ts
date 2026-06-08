import { describe, expect, it } from "vitest";

import {
  POSTER_BACKGROUNDS,
  WORLD_CUP_TEAMS,
  buildPosterImageUrl,
  formatKickoffTime,
  getMatchSchedule,
  getScheduleWarning,
} from "./matchday";
import {
  canRetryGenerateCopy,
  getGenerateCopyErrorMessage,
  getGenerateReadiness,
  getPreviewPanelAfterFeedback,
} from "./matchday-flow";

describe("matchday helpers", () => {
  it("contains the full forty-eight team selector list", () => {
    expect(WORLD_CUP_TEAMS).toHaveLength(48);
    expect(WORLD_CUP_TEAMS).toContain("Canada");
    expect(WORLD_CUP_TEAMS).toContain("Mexico");
    expect(WORLD_CUP_TEAMS).toContain("United States");
    expect(WORLD_CUP_TEAMS).toContain("Korea Republic");
    expect(WORLD_CUP_TEAMS).toContain("Côte d’Ivoire");
    expect(WORLD_CUP_TEAMS).toContain("Congo DR");
    expect(WORLD_CUP_TEAMS).not.toContain("USA");
    expect(WORLD_CUP_TEAMS).not.toContain("South Korea");
    expect(WORLD_CUP_TEAMS).not.toContain("UAE");
  });

  it("exposes local poster background presets", () => {
    expect(POSTER_BACKGROUNDS).toHaveLength(4);
    expect(POSTER_BACKGROUNDS[0]?.src).toBe("/images/bg-stadium-crowd.jpg");
  });

  it("finds official schedule data regardless of team order", () => {
    expect(getMatchSchedule("South Africa", "Mexico", "America/New_York")).toEqual({
      matchNumber: 1,
      group: "A",
      matchDate: "11 JUN 2026",
      kickoffTime: "15:00",
      timeZone: "America/New_York",
      sourceDateEt: "2026-06-11",
      sourceTimeEt: "15:00",
    });
  });

  it("formats official kickoff times for the user time zone", () => {
    expect(formatKickoffTime("2026-06-11T19:00:00Z", "Asia/Shanghai")).toEqual({
      matchDate: "12 JUN 2026",
      kickoffTime: "03:00",
    });
    expect(formatKickoffTime("2026-06-11T19:00:00Z", "America/Los_Angeles")).toEqual({
      matchDate: "11 JUN 2026",
      kickoffTime: "12:00",
    });
  });

  it("returns null and a warning for invalid team pairings", () => {
    expect(getMatchSchedule("Argentina", "Brazil", "America/New_York")).toBeNull();
    expect(getScheduleWarning("Argentina", "Brazil")).toBe(
      "No official FIFA 2026 group-stage fixture found for Argentina vs Brazil. Choose a valid matchup from the official schedule.",
    );
  });

  it("builds the poster image URL with local schedule and background params", () => {
    expect(
      buildPosterImageUrl({
        teamA: "Mexico",
        teamB: "South Africa",
        venueName: "Room by Le Kief",
        offerText: "$5 Pints During The Game",
        bgUrl: "/images/bg-neon-bar.jpg",
        isVip: false,
      }, "America/New_York"),
    ).toBe(
      "/api/og?teamA=Mexico&teamB=South+Africa&date=11+JUN+2026&time=15%3A00&bgUrl=%2Fimages%2Fbg-neon-bar.jpg&venueName=Room+by+Le+Kief&offer=%245+Pints+During+The+Game&isVip=false",
    );
  });
});

describe("getGenerateReadiness", () => {
  it("blocks invalid official fixtures before login or generation", () => {
    expect(
      getGenerateReadiness({
        formState: {
          teamA: "Argentina",
          teamB: "Brazil",
          venueName: "Corner Pub",
          offerText: "$5 Pints",
          bgUrl: "/images/bg-neon-bar.jpg",
          isVip: false,
        },
        timeZone: "America/New_York",
      }),
    ).toEqual({
      canGenerate: false,
      message:
        "No official FIFA 2026 group-stage fixture found for Argentina vs Brazil. Choose a valid matchup from the official schedule.",
    });
  });

  it("requires a venue name and offer before generating business copy", () => {
    expect(
      getGenerateReadiness({
        formState: {
          teamA: "Mexico",
          teamB: "South Africa",
          venueName: "",
          offerText: "",
          bgUrl: "/images/bg-stadium-crowd.jpg",
          isVip: false,
        },
        timeZone: "America/New_York",
      }),
    ).toEqual({
      canGenerate: false,
      message:
        "Add your venue name and matchday offer before generating the caption.",
    });
  });

  it("allows generation when fixture, venue, and offer are ready", () => {
    expect(
      getGenerateReadiness({
        formState: {
          teamA: "Mexico",
          teamB: "South Africa",
          venueName: "Corner Pub",
          offerText: "$5 Pints",
          bgUrl: "/images/bg-stadium-crowd.jpg",
          isVip: false,
        },
        timeZone: "America/New_York",
      }),
    ).toEqual({
      canGenerate: true,
      message: "",
    });
  });
});

describe("getPreviewPanelAfterFeedback", () => {
  it("switches to the copy panel when generated copy exists", () => {
    expect(
      getPreviewPanelAfterFeedback("image", "Join us tonight. #WorldCup2026", ""),
    ).toBe("copy");
  });

  it("switches to the copy panel when an error exists", () => {
    expect(
      getPreviewPanelAfterFeedback("image", "", "Unable to generate copy."),
    ).toBe("copy");
  });

  it("keeps the current panel when there is no feedback", () => {
    expect(getPreviewPanelAfterFeedback("image", "", "")).toBe("image");
    expect(getPreviewPanelAfterFeedback("copy", "", "")).toBe("copy");
  });
});

describe("getGenerateCopyErrorMessage", () => {
  it("turns server setup failures into a user-readable launch message", () => {
    expect(
      getGenerateCopyErrorMessage(
        503,
        "Caption generation is not configured. Expected DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in the environment.",
      ),
    ).toBe(
      "Caption generation is temporarily unavailable while auth and database setup is being finished. You can still preview and download the poster.",
    );
  });

  it("keeps the sign-in action clear for unauthorized requests", () => {
    expect(
      getGenerateCopyErrorMessage(
        401,
        "Sign in with Google before generating matchday copy.",
      ),
    ).toBe("Sign in with Google before generating matchday copy.");
  });

  it("uses a stable fallback when the server response is missing an error", () => {
    expect(getGenerateCopyErrorMessage(500, "")).toBe(
      "Unable to generate matchday copy. Try again in a moment.",
    );
  });
});

describe("canRetryGenerateCopy", () => {
  it("does not offer retry when the launch runtime is not configured", () => {
    expect(
      canRetryGenerateCopy(
        503,
        "Caption generation is not configured. Expected DATABASE_URL.",
      ),
    ).toBe(false);
  });

  it("keeps retry available for ordinary service failures", () => {
    expect(canRetryGenerateCopy(500, "Provider timed out.")).toBe(true);
  });
});
