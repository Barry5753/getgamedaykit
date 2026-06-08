import schedule from "../data/schedule.json";

export const WORLD_CUP_TEAMS = [
  "Mexico",
  "South Africa",
  "Korea Republic",
  "Czechia",
  "Canada",
  "Bosnia & Herzegovina",
  "Brazil",
  "Morocco",
  "United States",
  "Paraguay",
  "Haiti",
  "Scotland",
  "Australia",
  "Türkiye",
  "Qatar",
  "Switzerland",
  "Côte d’Ivoire",
  "Ecuador",
  "Germany",
  "Curaçao",
  "Netherlands",
  "Japan",
  "Sweden",
  "Tunisia",
  "Saudi Arabia",
  "Uruguay",
  "Spain",
  "Cabo Verde",
  "IR Iran",
  "New Zealand",
  "Belgium",
  "Egypt",
  "France",
  "Senegal",
  "Iraq",
  "Norway",
  "Argentina",
  "Algeria",
  "Austria",
  "Jordan",
  "Portugal",
  "Colombia",
  "England",
  "Croatia",
  "Ghana",
  "Panama",
  "Congo DR",
  "Uzbekistan",
] as const;

export const POSTER_BACKGROUNDS = [
  {
    id: "stadium-crowd",
    name: "Dark Stadium",
    src: "/images/bg-stadium-crowd.jpg",
  },
  {
    id: "neon-bar",
    name: "Neon Bar",
    src: "/images/bg-neon-bar.jpg",
  },
  {
    id: "stadium-lights",
    name: "Stadium Lights",
    src: "/images/bg-stadium-lights.jpg",
  },
  {
    id: "aerial-stadium",
    name: "Aerial Pitch",
    src: "/images/bg-aerial-stadium.jpg",
  },
] as const;

type ScheduleMatch = {
  matchNumber: number;
  group: string;
  teamA: string;
  teamB: string;
  kickoffUtc: string;
  sourceTimeZone: string;
  sourceDateEt: string;
  sourceTimeEt: string;
};

type FormattedMatchSchedule = {
  matchNumber: number;
  group: string;
  matchDate: string;
  kickoffTime: string;
  timeZone: string;
  sourceDateEt: string;
  sourceTimeEt: string;
};

export type PosterFormState = {
  teamA: string;
  teamB: string;
  venueName: string;
  offerText: string;
  bgUrl: string;
  isVip: boolean;
};

export const initialPosterFormState: PosterFormState = {
  teamA: "Mexico",
  teamB: "South Africa",
  venueName: "Room by Le Kief",
  offerText: "$5 Pints During The Game",
  bgUrl: POSTER_BACKGROUNDS[0].src,
  isVip: false,
};

export function getUserTimeZone() {
  if (typeof window === "undefined") {
    return "UTC";
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function getMatchSchedule(
  teamA: string,
  teamB: string,
  timeZone = "UTC",
): FormattedMatchSchedule | null {
  const scheduleMatch = (schedule as ScheduleMatch[]).find(
    (match) =>
      (match.teamA === teamA && match.teamB === teamB) ||
      (match.teamA === teamB && match.teamB === teamA),
  );

  if (!scheduleMatch) {
    return null;
  }

  const formattedKickoff = formatKickoffTime(
    scheduleMatch.kickoffUtc,
    timeZone,
  );

  return {
    matchNumber: scheduleMatch.matchNumber,
    group: scheduleMatch.group,
    matchDate: formattedKickoff.matchDate,
    kickoffTime: formattedKickoff.kickoffTime,
    timeZone,
    sourceDateEt: scheduleMatch.sourceDateEt,
    sourceTimeEt: scheduleMatch.sourceTimeEt,
  };
}

export function getScheduleWarning(teamA: string, teamB: string) {
  if (getMatchSchedule(teamA, teamB)) {
    return "";
  }

  return `No official FIFA 2026 group-stage fixture found for ${teamA} vs ${teamB}. Choose a valid matchup from the official schedule.`;
}

export function buildPosterImageUrl(
  formState: PosterFormState,
  timeZone = "UTC",
) {
  const matchSchedule = getMatchSchedule(
    formState.teamA,
    formState.teamB,
    timeZone,
  );
  const searchParams = new URLSearchParams({
    teamA: formState.teamA,
    teamB: formState.teamB,
    date: matchSchedule?.matchDate ?? "OFFICIAL FIXTURE NOT FOUND",
    time: matchSchedule?.kickoffTime ?? "--:--",
    bgUrl: formState.bgUrl,
  });

  addSearchParam(searchParams, "venueName", formState.venueName);
  addSearchParam(searchParams, "offer", formState.offerText);

  searchParams.set("isVip", String(formState.isVip));

  return `/api/og?${searchParams.toString()}`;
}

export function formatKickoffTime(kickoffUtc: string, timeZone: string) {
  const kickoffDate = new Date(kickoffUtc);

  if (Number.isNaN(kickoffDate.getTime())) {
    throw new Error(
      `Invalid schedule data: kickoffUtc must be an ISO date string; received ${kickoffUtc}.`,
    );
  }

  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(kickoffDate);
  const day = getDatePart(dateParts, "day");
  const month = getDatePart(dateParts, "month").toUpperCase();
  const year = getDatePart(dateParts, "year");
  const kickoffTime = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(kickoffDate);

  return {
    matchDate: `${day} ${month} ${year}`,
    kickoffTime,
  };
}

function getDatePart(
  dateParts: Intl.DateTimeFormatPart[],
  partType: Intl.DateTimeFormatPartTypes,
) {
  const datePart = dateParts.find((part) => part.type === partType);

  if (!datePart) {
    throw new Error(
      `Invalid date formatting result: expected ${partType} in Intl.DateTimeFormat parts.`,
    );
  }

  return datePart.value;
}

function addSearchParam(
  searchParams: URLSearchParams,
  key: string,
  value: string,
) {
  const trimmedValue = value.trim();

  if (trimmedValue) {
    searchParams.set(key, trimmedValue);
  }
}
