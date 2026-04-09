import OpenAI from "openai";
import { NextResponse } from "next/server";

type SystemInput = {
  key: string;
  name: string;
  note: string;
  selectedBrand: string;
};

type PropertyProfile = {
  bedrooms: number;
  kitchens: number;
  dens: number;
  recreationRooms: number;
  porches: number;
  poolHouse: "Yes" | "No";
  patio: number;
  screenedInPorch: number;
  squareFootage: number;
};

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return valid JSON.");
  }

  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Set OPENAI_API_KEY in your environment to enable Analyst Review.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    systems?: SystemInput[];
    tertiarySystems?: { name: string; note: string }[];
    profile?: PropertyProfile;
  };

  const systems = body.systems ?? [];
  const tertiarySystems = body.tertiarySystems ?? [];
  const profile = body.profile;
  const client = new OpenAI({ apiKey });

  const prompt = [
    "You are a smart-home systems analyst.",
    "Review the following home technology stack and return JSON only.",
    'Use this exact shape: {"grade":"A-F with optional +/-","summary":"...","strengths":["..."],"risks":["..."],"recommendations":["..."],"brandSpecificNotes":["..."],"swapRecommendations":[{"category":"...","currentBrand":"...","suggestedBrand":"...","reason":"...","expectedImpact":"..."}],"estimatedCosts":{"installationRange":"...","annualSubscriptionRange":"...","costDrivers":["..."],"categoryBreakdown":[{"category":"...","brand":"...","installationEstimate":"...","annualSubscriptionEstimate":"...","notes":"..."}]}}',
    "Keep summary to 2 sentences max.",
    "Return 3 strengths, 3 risks, 3 recommendations, 4 brandSpecificNotes, 2 to 4 swapRecommendations, 3 costDrivers, and one categoryBreakdown item for each enabled core system.",
    "Mention the selected brands explicitly by name throughout the review.",
    "If the grade is not A, recommend concrete brand swaps that would likely improve the grade.",
    "Estimate installed project cost and annual subscription fees based on property size and room count.",
    "Provide a vendor-by-vendor cost cut with installation and annual subscription estimates for each enabled category.",
    "Focus on compatibility, scalability, functionality, reliability, installer friendliness, and long-term ownership.",
    "",
    "Property profile:",
    `- Bedrooms: ${profile?.bedrooms ?? 0}`,
    `- Kitchens: ${profile?.kitchens ?? 0}`,
    `- Dens: ${profile?.dens ?? 0}`,
    `- Recreation rooms: ${profile?.recreationRooms ?? 0}`,
    `- Porches: ${profile?.porches ?? 0}`,
    `- Pool house: ${profile?.poolHouse ?? "No"}`,
    `- Patios: ${profile?.patio ?? 0}`,
    `- Screened-in porches: ${profile?.screenedInPorch ?? 0}`,
    `- Total square footage: ${profile?.squareFootage ?? 0}`,
    "",
    "Core systems:",
    ...systems.map(
      (system) =>
        `- ${system.name}: ${system.selectedBrand}. Context: ${system.note}`,
    ),
    "",
    "Tertiary extras:",
    ...tertiarySystems.map((system) => `- ${system.name}: ${system.note}`),
  ].join("\n");

  let outputText: string | undefined;

  try {
    const response = await client.responses.create({
      model,
      input: prompt,
    });

    outputText = response.output_text;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OpenAI request failed.";

    return NextResponse.json(
      {
        error: `OpenAI request failed: ${message}`,
      },
      { status: 500 },
    );
  }

  if (!outputText) {
    return NextResponse.json(
      {
        error: "OpenAI returned no text output.",
      },
      { status: 500 },
    );
  }

  try {
    const result = extractJsonObject(outputText);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      {
        error: "OpenAI returned text, but it was not valid JSON.",
      },
      { status: 500 },
    );
  }
}
