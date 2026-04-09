export const product = {
  name: "Home Stack",
  tagline: "Build the ideal smart-home stack, then let AI grade the whole system.",
  description:
    "Compare home technology categories like a stacked slot machine, choose one brand for each system, and use ChatGPT to score the final configuration for compatibility, scalability, functionality, and overall fit.",
};

export type SystemCategory = {
  key: string;
  name: string;
  note: string;
  selectedBrand: string;
  brands: readonly string[];
};

export type SelectionMap = Record<string, string>;

export const coreSystemHorizontals: readonly SystemCategory[] = [
  {
    key: "unification",
    name: "Unification System",
    note: "The master layer that ties the house together.",
    selectedBrand: "Control4",
    brands: [
      "Control4",
      "Crestron Home",
      "Apple",
      "Savant",
      "AMX",
      "Josh.ai",
      "RTI",
      "URC",
      "ELAN",
      "Home Assistant",
      "Alexa",
      "Google Home",
    ],
  },
  {
    key: "security",
    name: "Security System",
    note: "Entry, surveillance, alerts, and remote awareness.",
    selectedBrand: "Alarm.com",
    brands: [
      "Alarm.com",
      "Resideo (Honeywell Home)",
      "Alula",
      "DSC / Johnson Controls",
      "Philips Hue",
      "Ring",
      "SimpliSafe",
      "Google Nest",
    ],
  },
  {
    key: "surveillance",
    name: "Surveillance",
    note: "Camera coverage, recording, and investigative visibility.",
    selectedBrand: "Alarm.com",
    brands: ["Alarm.com", "IC Realtime", "Luma / Control4", "Google Nest"],
  },
  {
    key: "smart-locks",
    name: "Smart Door Locks",
    note: "Secure access, credential management, and entry automation.",
    selectedBrand: "Yale",
    brands: ["Kwikset", "August", "Yale", "Schlage", "Aqara", "Wyze"],
  },
  {
    key: "sound",
    name: "Sound System",
    note: "Whole-home audio, zones, and media flexibility.",
    selectedBrand: "Sonos",
    brands: ["Sonos", "Bluesound", "Denon HEOS", "Wiim"],
  },
  {
    key: "lighting",
    name: "Lighting System",
    note: "Scenes, dimming, keypads, and automation logic.",
    selectedBrand: "Lutron",
    brands: [
      "Lutron",
      "Vantage",
      "Savant",
      "KNX",
      "Z-Wave",
      "GE Lighting",
      "Philips Hue",
    ],
  },
  {
    key: "fan",
    name: "Fan System",
    note: "Ceiling fan control, comfort, and energy behavior.",
    selectedBrand: "Lutron",
    brands: ["Lutron", "Control4", "Leviton", "Ring"],
  },
  {
    key: "shade",
    name: "Shade System",
    note: "Privacy, glare control, and daylight orchestration.",
    selectedBrand: "Lutron",
    brands: ["Lutron", "Hunter Douglas", "Somfy"],
  },
  {
    key: "hvac",
    name: "HVAC / Thermostat",
    note: "Climate control, scheduling, and occupancy tuning.",
    selectedBrand: "Ecobee",
    brands: [
      "Lutron",
      "Control4",
      "Crestron Home",
      "Alarm.com",
      "Ecobee",
      "Nest Thermostat",
      "Home Assistant",
      "Eve",
    ],
  },
  {
    key: "additional-core",
    name: "Additional Core System",
    note: "Reserved slot for a tenth core category such as garage, energy, or access control.",
    selectedBrand: "TBD",
    brands: ["Garage Doors", "Energy Storage", "Access Control", "Networking", "TBD"],
  },
];

export const tertiarySystems: readonly SystemCategory[] = [
  {
    key: "sprinkler",
    name: "Sprinkler System",
    note: "Irrigation intelligence, weather response, and zoning. Brands not yet pulled from the screenshot.",
    selectedBrand: "TBD",
    brands: ["TBD"],
  },
  {
    key: "pool",
    name: "Pool System",
    note: "Pool pumps, heating, chemistry, and remote control. Brands not yet pulled from the screenshot.",
    selectedBrand: "TBD",
    brands: ["TBD"],
  },
] as const;

export const gradingCriteria = [
  "Compatibility",
  "Scalability",
  "Functionality",
  "Reliability",
  "Installer friendliness",
  "Long-term ownership",
] as const;

export const sampleAssessment = {
  score: "B+",
  summary:
    "Strong premium stack with great lighting and control foundations. Biggest watch-outs are ecosystem overlap and making sure security, surveillance, and lock layers expose clean integrations.",
  highlights: [
    "Lutron plus Control4 is a strong core for scenes and whole-home orchestration.",
    "Sonos keeps audio simple for homeowners and guests.",
    "Ecobee paired with thoughtful security and access choices can support a polished homeowner experience.",
  ],
  risks: [
    "Ring or closed security systems may limit advanced automations.",
    "Smart locks and surveillance should be evaluated alongside the primary unification platform, not as isolated add-ons.",
    "Shade, fan, and lighting brands should be checked for duplicate bridges and app sprawl.",
  ],
} as const;

export function getDefaultSelections(
  systems: readonly SystemCategory[],
): SelectionMap {
  return Object.fromEntries(
    systems.map((system) => [system.key, system.selectedBrand]),
  );
}

export function countConfiguredSystems(
  systems: readonly SystemCategory[],
  selections: SelectionMap,
): number {
  return systems.filter((system) => {
    const selected = selections[system.key];
    return selected && selected !== "TBD";
  }).length;
}

export function estimateStackGrade(
  systems: readonly SystemCategory[],
  selections: SelectionMap,
): string {
  const configured = countConfiguredSystems(systems, selections);
  const ratio = configured / systems.length;

  if (ratio >= 1) return "A-";
  if (ratio >= 0.8) return "B+";
  if (ratio >= 0.6) return "B";
  if (ratio >= 0.4) return "C+";
  return "C";
}
