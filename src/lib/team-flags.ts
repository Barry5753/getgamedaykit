const flagCdnBaseUrl =
  "https://purecatamphetamine.github.io/country-flag-icons/1x1";

export const teamCountryCodes = {
  "United States": "US",
  Canada: "CA",
  Mexico: "MX",
  "South Africa": "ZA",
  "Korea Republic": "KR",
  Czechia: "CZ",
  "Bosnia & Herzegovina": "BA",
  Argentina: "AR",
  Brazil: "BR",
  England: "GB",
  France: "FR",
  Spain: "ES",
  Germany: "DE",
  Netherlands: "NL",
  Portugal: "PT",
  Belgium: "BE",
  Croatia: "HR",
  Morocco: "MA",
  Japan: "JP",
  Australia: "AU",
  "Saudi Arabia": "SA",
  "IR Iran": "IR",
  Senegal: "SN",
  Tunisia: "TN",
  Ghana: "GH",
  Uruguay: "UY",
  Colombia: "CO",
  Ecuador: "EC",
  Switzerland: "CH",
  Sweden: "SE",
  Scotland: "GB",
  Egypt: "EG",
  Algeria: "DZ",
  Panama: "PA",
  "New Zealand": "NZ",
  Iraq: "IQ",
  Paraguay: "PY",
  Haiti: "HT",
  Türkiye: "TR",
  Qatar: "QA",
  "Côte d’Ivoire": "CI",
  Curaçao: "CW",
  "Cabo Verde": "CV",
  Norway: "NO",
  Austria: "AT",
  Jordan: "JO",
  "Congo DR": "CD",
  Uzbekistan: "UZ",
} as const;

export function getTeamCountryCode(teamName: string) {
  return teamCountryCodes[teamName as keyof typeof teamCountryCodes] ?? null;
}

export function getTeamFlagSrc(teamName: string) {
  const countryCode = getTeamCountryCode(teamName);

  if (!countryCode) {
    return null;
  }

  return `${flagCdnBaseUrl}/${countryCode}.svg`;
}

export function getTeamFlagEmoji(teamName: string) {
  const countryCode = getTeamCountryCode(teamName);

  if (!countryCode || countryCode.length !== 2) {
    return null;
  }

  return countryCode
    .toUpperCase()
    .replace(/./g, (letter) =>
      String.fromCodePoint(127397 + letter.charCodeAt(0)),
    );
}
