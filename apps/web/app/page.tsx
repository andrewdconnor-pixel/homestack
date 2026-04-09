"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  coreSystemHorizontals,
  estimateStackGrade,
  getDefaultSelections,
  tertiarySystems,
} from "@new-app-suite/shared";

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

type SwapRecommendation = {
  category: string;
  currentBrand: string;
  suggestedBrand: string;
  reason: string;
  expectedImpact: string;
};

type CostEstimate = {
  installationRange: string;
  annualSubscriptionRange: string;
  costDrivers: string[];
  categoryBreakdown: {
    category: string;
    brand: string;
    installationEstimate: string;
    annualSubscriptionEstimate: string;
    notes: string;
  }[];
};

type AnalysisResult = {
  grade: string;
  summary: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
  brandSpecificNotes: string[];
  swapRecommendations: SwapRecommendation[];
  estimatedCosts: CostEstimate;
};

const defaultProfile: PropertyProfile = {
  bedrooms: 5,
  kitchens: 1,
  dens: 1,
  recreationRooms: 1,
  porches: 1,
  poolHouse: "No",
  patio: 1,
  screenedInPorch: 0,
  squareFootage: 4200,
};

const fallbackReview: AnalysisResult = {
  grade: "Awaiting review",
  summary:
    "Run Analyst Review to get a brand-specific assessment of the current Home Stack configuration.",
  strengths: [
    "The slot machine makes it easy to compare whole-home platform combinations.",
  ],
  risks: [
    "No analyst review has been run yet for this exact property profile and brand set.",
  ],
  recommendations: [
    "Set the property details and click Analyst Review for a brand-level report.",
  ],
  brandSpecificNotes: [
    "Analyst output will call out the exact selected brands in each category.",
  ],
  swapRecommendations: [],
  estimatedCosts: {
    installationRange: "Run analysis",
    annualSubscriptionRange: "Run analysis",
    costDrivers: ["Home size and system count heavily influence the estimate."],
    categoryBreakdown: [],
  },
};

function rotateSelection(
  brands: readonly string[],
  currentBrand: string,
  direction: 1 | -1,
) {
  const currentIndex = Math.max(brands.indexOf(currentBrand), 0);
  const nextIndex = (currentIndex + direction + brands.length) % brands.length;
  return brands[nextIndex];
}

function randomSelection(brands: readonly string[]) {
  return brands[Math.floor(Math.random() * brands.length)];
}

export default function Home() {
  const [selections, setSelections] = useState(() =>
    getDefaultSelections(coreSystemHorizontals),
  );
  const [enabledSystems, setEnabledSystems] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        coreSystemHorizontals.map((system) => [
          system.key,
          system.selectedBrand !== "TBD",
        ]),
      ),
  );
  const [profile, setProfile] = useState<PropertyProfile>(defaultProfile);
  const [analysis, setAnalysis] = useState<AnalysisResult>(fallbackReview);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSystems = coreSystemHorizontals.filter(
    (system) => enabledSystems[system.key] !== false,
  );
  const estimatedGrade = estimateStackGrade(activeSystems, selections);

  useEffect(() => {
    setAnalysis(fallbackReview);
    setError(null);
  }, [selections, enabledSystems, profile]);

  function updateProfileNumber(
    key: Exclude<keyof PropertyProfile, "poolHouse">,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const value = Number(event.target.value);
    setProfile((current) => ({
      ...current,
      [key]: Number.isFinite(value) ? value : 0,
    }));
  }

  async function analyzeStack() {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systems: activeSystems.map((system) => ({
            key: system.key,
            name: system.name,
            note: system.note,
            selectedBrand: selections[system.key],
          })),
          tertiarySystems,
          profile,
        }),
      });

      const payload = (await response.json()) as
        | { result?: AnalysisResult; error?: string }
        | undefined;

      if (!response.ok || !payload?.result) {
        throw new Error(payload?.error ?? "Analysis failed.");
      }

      setAnalysis(payload.result);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Analysis failed.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function spinRandom() {
    setSelections(
      Object.fromEntries(
        activeSystems.map((system) => [
          system.key,
          randomSelection(system.brands),
        ]),
      ),
    );
    setError(null);
  }

  function printReport() {
    window.print();
  }

  return (
    <main className="page-shell">
      <section className="machine-shell" id="machine">
        <div className="machine-header">
          <p className="machine-kicker">Home Stack</p>
          <h1>Home Stack Slot Machine</h1>
        </div>

        <div className="slot-machine">
          <div className="machine-marquee">
            <span>Choose the winning vendor combination</span>
          </div>

          <div className="slot-frame">
            <div className="slot-columns" role="list" aria-label="Vendor reels">
              {activeSystems.map((system, index) => {
                const selectedBrand = selections[system.key];
                const selectedIndex = Math.max(
                  system.brands.indexOf(selectedBrand),
                  0,
                );
                const previousBrand =
                  system.brands[
                    (selectedIndex - 1 + system.brands.length) %
                      system.brands.length
                  ];
                const nextBrand =
                  system.brands[(selectedIndex + 1) % system.brands.length];

                return (
                  <section key={system.key} className="slot-column" role="listitem">
                    <div className="slot-column-top">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <h2>{system.name}</h2>
                    </div>

                    <button
                      type="button"
                      className="slot-arrow"
                      aria-label={`Rotate ${system.name} up`}
                      onClick={() =>
                        setSelections((current) => ({
                          ...current,
                          [system.key]: rotateSelection(
                            system.brands,
                            current[system.key],
                            -1,
                          ),
                        }))
                      }
                    >
                      ▲
                    </button>

                    <div className="slot-reel">
                      <span className="slot-brand slot-brand-faded">
                        {previousBrand}
                      </span>
                      <span className="slot-brand slot-brand-active">
                        {selectedBrand}
                      </span>
                      <span className="slot-brand slot-brand-faded">
                        {nextBrand}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="slot-arrow"
                      aria-label={`Rotate ${system.name} down`}
                      onClick={() =>
                        setSelections((current) => ({
                          ...current,
                          [system.key]: rotateSelection(
                            system.brands,
                            current[system.key],
                            1,
                          ),
                        }))
                      }
                    >
                      ▼
                    </button>

                    <label className="slot-select-wrap">
                      <span>Pick</span>
                      <select
                        value={selectedBrand}
                        onChange={(event) =>
                          setSelections((current) => ({
                            ...current,
                            [system.key]: event.target.value,
                          }))
                        }
                      >
                        {system.brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </label>
                  </section>
                );
              })}
            </div>
          </div>

          <div className="machine-controls">
            <button type="button" className="action-button spin" onClick={spinRandom}>
              Spin Random
            </button>
            <button
              type="button"
              className="action-button analyst"
              onClick={analyzeStack}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyst Review"}
            </button>
            <button
              type="button"
              className="action-button print"
              onClick={printReport}
            >
              Print / Save PDF
            </button>
          </div>
        </div>

        <div className="profile-panel">
          <h3>Category controls</h3>
          <div className="toggle-grid">
            {coreSystemHorizontals.map((system) => (
              <label key={system.key} className="toggle-chip">
                <input
                  type="checkbox"
                  checked={enabledSystems[system.key] !== false}
                  onChange={(event) =>
                    setEnabledSystems((current) => ({
                      ...current,
                      [system.key]: event.target.checked,
                    }))
                  }
                />
                <span>{system.name}</span>
              </label>
            ))}
          </div>

          <h3>Property profile</h3>
          <div className="profile-grid">
            <label>
              <span>Bedrooms</span>
              <input
                type="number"
                min="0"
                value={profile.bedrooms}
                onChange={(event) => updateProfileNumber("bedrooms", event)}
              />
            </label>
            <label>
              <span>Kitchens</span>
              <input
                type="number"
                min="0"
                value={profile.kitchens}
                onChange={(event) => updateProfileNumber("kitchens", event)}
              />
            </label>
            <label>
              <span>Dens</span>
              <input
                type="number"
                min="0"
                value={profile.dens}
                onChange={(event) => updateProfileNumber("dens", event)}
              />
            </label>
            <label>
              <span>Recreation rooms</span>
              <input
                type="number"
                min="0"
                value={profile.recreationRooms}
                onChange={(event) =>
                  updateProfileNumber("recreationRooms", event)
                }
              />
            </label>
            <label>
              <span>Porches</span>
              <input
                type="number"
                min="0"
                value={profile.porches}
                onChange={(event) => updateProfileNumber("porches", event)}
              />
            </label>
            <label>
              <span>Pool house</span>
              <select
                value={profile.poolHouse}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    poolHouse: event.target.value as "Yes" | "No",
                  }))
                }
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
            <label>
              <span>Patios</span>
              <input
                type="number"
                min="0"
                value={profile.patio}
                onChange={(event) => updateProfileNumber("patio", event)}
              />
            </label>
            <label>
              <span>Screened porches</span>
              <input
                type="number"
                min="0"
                value={profile.screenedInPorch}
                onChange={(event) =>
                  updateProfileNumber("screenedInPorch", event)
                }
              />
            </label>
            <label className="profile-wide">
              <span>Total square footage</span>
              <input
                type="number"
                min="0"
                step="100"
                value={profile.squareFootage}
                onChange={(event) => updateProfileNumber("squareFootage", event)}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="review-zone">
        <div className="review-topline">
          <div className="review-grade">
            <span>Estimated / analyst grade</span>
            <strong>{analysis.grade || estimatedGrade}</strong>
          </div>
          <div className="review-summary">
            <span>Review summary</span>
            <p>{analysis.summary}</p>
            {error ? <p className="error-text">{error}</p> : null}
          </div>
          <div className="review-costs">
            <span>Estimated costs</span>
            <p>
              Install: {analysis.estimatedCosts.installationRange}
              <br />
              Annual subscriptions:{" "}
              {analysis.estimatedCosts.annualSubscriptionRange}
            </p>
          </div>
        </div>

        <div className="criteria-strip">
          <span>Compatibility</span>
          <span>Scalability</span>
          <span>Functionality</span>
          <span>Reliability</span>
          <span>Installer friendliness</span>
          <span>Long-term ownership</span>
        </div>

        <div className="review-grid">
          <article className="review-card">
            <h3>Brand-specific notes</h3>
            <ul>
              {analysis.brandSpecificNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="review-card">
            <h3>Strengths</h3>
            <ul>
              {analysis.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="review-card">
            <h3>Risks</h3>
            <ul>
              {analysis.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="review-card">
            <h3>General recommendations</h3>
            <ul>
              {analysis.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="review-grid lower">
          <article className="review-card swap-card">
            <h3>Recommended brand swaps</h3>
            <ul>
              {analysis.swapRecommendations.length ? (
                analysis.swapRecommendations.map((swap) => (
                  <li key={`${swap.category}-${swap.currentBrand}-${swap.suggestedBrand}`}>
                    <strong>{swap.category}</strong>: swap {swap.currentBrand} for{" "}
                    {swap.suggestedBrand}. {swap.reason} Impact: {swap.expectedImpact}
                  </li>
                ))
              ) : (
                <li>No swap recommendations yet.</li>
              )}
            </ul>
          </article>

          <article className="review-card tertiary">
            <h3>Cost drivers</h3>
            <ul>
              {analysis.estimatedCosts.costDrivers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="review-card tertiary cost-breakdown">
            <h3>Vendor-by-vendor cost cut</h3>
            <ul>
              {analysis.estimatedCosts.categoryBreakdown.length ? (
                analysis.estimatedCosts.categoryBreakdown.map((item) => (
                  <li key={`${item.category}-${item.brand}`}>
                    <strong>
                      {item.category}: {item.brand}
                    </strong>
                    <br />
                    Install: {item.installationEstimate}
                    <br />
                    Annual: {item.annualSubscriptionEstimate}
                    <br />
                    {item.notes}
                  </li>
                ))
              ) : (
                <li>No detailed cost cut yet.</li>
              )}
            </ul>
          </article>

          <article className="review-card tertiary">
            <h3>Tertiary extras</h3>
            <ul>
              {tertiarySystems.map((system) => (
                <li key={system.key}>
                  <strong>{system.name}</strong>: {system.note}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="report-export">
        <div className="report-header">
          <div>
            <p className="machine-kicker">Home Stack Report</p>
            <h2>Printable project summary</h2>
          </div>
          <div className="report-grade">
            <span>Final grade</span>
            <strong>{analysis.grade || estimatedGrade}</strong>
          </div>
        </div>

        <div className="report-grid">
          <article className="report-card">
            <h3>Selected brands</h3>
            <ul>
              {activeSystems.map((system) => (
                <li key={system.key}>
                  <strong>{system.name}</strong>: {selections[system.key]}
                </li>
              ))}
            </ul>
          </article>

          <article className="report-card">
            <h3>Property profile</h3>
            <ul>
              <li>Bedrooms: {profile.bedrooms}</li>
              <li>Kitchens: {profile.kitchens}</li>
              <li>Dens: {profile.dens}</li>
              <li>Recreation rooms: {profile.recreationRooms}</li>
              <li>Porches: {profile.porches}</li>
              <li>Pool house: {profile.poolHouse}</li>
              <li>Patios: {profile.patio}</li>
              <li>Screened porches: {profile.screenedInPorch}</li>
              <li>Square footage: {profile.squareFootage}</li>
            </ul>
          </article>

          <article className="report-card">
            <h3>Executive summary</h3>
            <p>{analysis.summary}</p>
            <p>
              Installation estimate: {analysis.estimatedCosts.installationRange}
              <br />
              Annual subscriptions:{" "}
              {analysis.estimatedCosts.annualSubscriptionRange}
            </p>
          </article>
        </div>

        <div className="report-grid lower">
          <article className="report-card">
            <h3>Recommended swaps</h3>
            <ul>
              {analysis.swapRecommendations.length ? (
                analysis.swapRecommendations.map((swap) => (
                  <li key={`${swap.category}-${swap.currentBrand}-${swap.suggestedBrand}`}>
                    <strong>{swap.category}</strong>: {swap.currentBrand} to{" "}
                    {swap.suggestedBrand}. {swap.reason}
                  </li>
                ))
              ) : (
                <li>No swap recommendations.</li>
              )}
            </ul>
          </article>

          <article className="report-card">
            <h3>Vendor-by-vendor cost cut</h3>
            <ul>
              {analysis.estimatedCosts.categoryBreakdown.length ? (
                analysis.estimatedCosts.categoryBreakdown.map((item) => (
                  <li key={`${item.category}-${item.brand}`}>
                    <strong>{item.category}</strong>: {item.brand}
                    <br />
                    Install: {item.installationEstimate}
                    <br />
                    Annual: {item.annualSubscriptionEstimate}
                  </li>
                ))
              ) : (
                <li>No detailed cost cut yet.</li>
              )}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
