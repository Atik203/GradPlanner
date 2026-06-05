export interface TimezoneAdvice {
  country: string;
  localWindow: string;
  bdtWindow: string;
  advice: string;
}

export function getBdtOutreachAdvice(countryName: string | null | undefined): TimezoneAdvice {
  if (!countryName) {
    return {
      country: "Unknown",
      localWindow: "8:30 AM - 9:30 AM (Local Time)",
      bdtWindow: "Tue-Thu morning/afternoon",
      advice: "Send during the professor's local morning (Tue-Thu 8:30-9:30 AM).",
    };
  }

  const normalized = countryName.trim().toLowerCase();

  // USA and Canada
  if (normalized.includes("united states") || normalized === "usa" || normalized === "us" || normalized.includes("canada")) {
    return {
      country: countryName,
      localWindow: "Tue-Thu 8:30 AM - 9:30 AM (Local Time)",
      bdtWindow: "BDT 6:30 PM - 11:30 PM",
      advice: "Best send times in Bangladesh Time: BDT 6:30 PM to 10:30 PM (corresponds to local Eastern to Pacific morning windows). Avoid sending on Friday/Monday.",
    };
  }

  // Western Europe (Germany, Netherlands, Sweden, Switzerland, Finland, France, Belgium, etc.)
  if (
    normalized.includes("germany") ||
    normalized.includes("netherlands") ||
    normalized.includes("sweden") ||
    normalized.includes("switzerland") ||
    normalized.includes("finland") ||
    normalized.includes("france") ||
    normalized.includes("norway") ||
    normalized.includes("denmark") ||
    normalized.includes("belgium") ||
    normalized.includes("austria") ||
    normalized.includes("italy") ||
    normalized.includes("spain")
  ) {
    return {
      country: countryName,
      localWindow: "Tue-Thu 8:30 AM - 9:30 AM (Local Time)",
      bdtWindow: "BDT 12:30 PM - 2:30 PM",
      advice: "Best send times in Bangladesh Time: BDT 12:30 PM to 2:30 PM (depending on Daylight Savings). Fits local European morning slot.",
    };
  }

  // UK and Ireland
  if (normalized.includes("united kingdom") || normalized === "uk" || normalized.includes("ireland")) {
    return {
      country: countryName,
      localWindow: "Tue-Thu 8:30 AM - 9:30 AM (Local Time)",
      bdtWindow: "BDT 1:30 PM - 3:30 PM",
      advice: "Best send times in Bangladesh Time: BDT 1:30 PM to 3:30 PM (depending on Daylight Savings). Fits local UK/Ireland morning slot.",
    };
  }

  // Japan and South Korea
  if (normalized.includes("japan") || normalized.includes("korea")) {
    return {
      country: countryName,
      localWindow: "Tue-Thu 8:30 AM - 9:30 AM (Local Time)",
      bdtWindow: "BDT 5:30 AM - 6:30 AM",
      advice: "Best send times in Bangladesh Time: Early morning, BDT 5:30 AM to 6:30 AM. Highly recommended to use a scheduled send feature.",
    };
  }

  // Australia and New Zealand
  if (normalized.includes("australia") || normalized.includes("new zealand")) {
    return {
      country: countryName,
      localWindow: "Tue-Thu 8:30 AM - 9:30 AM (Local Time)",
      bdtWindow: "BDT 3:30 AM - 5:30 AM",
      advice: "Best send times in Bangladesh Time: Very early, BDT 3:30 AM to 5:30 AM (depending on state/Daylight Savings). Recommended to use email scheduling.",
    };
  }

  // UAE (United Arab Emirates)
  if (normalized.includes("united arab emirates") || normalized === "uae") {
    return {
      country: countryName,
      localWindow: "Tue-Thu 8:30 AM - 9:30 AM (Local Time)",
      bdtWindow: "BDT 10:30 AM - 11:30 AM",
      advice: "Best send times in Bangladesh Time: BDT 10:30 AM to 11:30 AM. UAE is 2 hours behind Bangladesh.",
    };
  }

  // Default fallback
  return {
    country: countryName,
    localWindow: "Tue-Thu 8:30 AM - 9:30 AM (Local Time)",
    bdtWindow: "Tue-Thu local morning",
    advice: "Send when it is Tue-Thu morning (8:30-9:30 AM) in the professor's country. Avoid weekends.",
  };
}
