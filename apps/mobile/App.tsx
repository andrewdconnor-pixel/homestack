import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  countConfiguredSystems,
  coreSystemHorizontals,
  estimateStackGrade,
  getDefaultSelections,
  gradingCriteria,
  product,
  sampleAssessment,
  tertiarySystems,
} from "@new-app-suite/shared";

export default function App() {
  const [activeSystemKey, setActiveSystemKey] = useState(
    coreSystemHorizontals[0]?.key ?? "",
  );
  const [selections, setSelections] = useState(() =>
    getDefaultSelections(coreSystemHorizontals),
  );

  const activeSystem =
    coreSystemHorizontals.find((system) => system.key === activeSystemKey) ??
    coreSystemHorizontals[0];
  const configuredCount = countConfiguredSystems(coreSystemHorizontals, selections);
  const grade = estimateStackGrade(coreSystemHorizontals, selections);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Mobile configurator</Text>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.tagline}>{product.tagline}</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.heroMetrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Configured</Text>
            <Text style={styles.metricValue}>
              {configuredCount}/{coreSystemHorizontals.length}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Estimated grade</Text>
            <Text style={styles.metricValue}>{grade}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Extras</Text>
            <Text style={styles.metricValue}>{tertiarySystems.length}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.panelEyebrow}>AI stack review</Text>
            <Text style={styles.panelTitle}>
              {configuredCount} core systems configured
            </Text>
            <Text style={styles.assessmentSummary}>
              Choose a system, tap a brand, and watch the Home Stack review sharpen
              before you ever send the configuration to ChatGPT.
            </Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreLabel}>Grade</Text>
            <Text style={styles.scoreValue}>{grade}</Text>
          </View>
        </View>

        <View style={styles.criteriaRow}>
          {gradingCriteria.map((criterion) => (
            <View key={criterion} style={styles.criteriaPill}>
              <Text style={styles.criteriaText}>{criterion}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Pick a core system</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.systemTabs}
          >
            {coreSystemHorizontals.map((system, index) => {
              const isActive = system.key === activeSystem.key;
              const selectedBrand = selections[system.key];

              return (
                <Pressable
                  key={system.key}
                  onPress={() => setActiveSystemKey(system.key)}
                  style={[
                    styles.systemTab,
                    isActive && styles.systemTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.systemTabIndex,
                      isActive && styles.systemTabIndexActive,
                    ]}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text
                    style={[
                      styles.systemTabTitle,
                      isActive && styles.systemTabTitleActive,
                    ]}
                  >
                    {system.name}
                  </Text>
                  <Text
                    style={[
                      styles.systemTabValue,
                      isActive && styles.systemTabValueActive,
                    ]}
                  >
                    {selectedBrand}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.focusCard}>
          <View style={styles.focusHeader}>
            <View style={styles.systemHeadingBlock}>
              <Text style={styles.systemName}>{activeSystem.name}</Text>
              <Text style={styles.systemNote}>{activeSystem.note}</Text>
            </View>
            <View style={styles.selectionBadge}>
              <Text style={styles.selectionLabel}>Selected</Text>
              <Text style={styles.selectionValue}>
                {selections[activeSystem.key]}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>2. Choose a brand</Text>
          <View style={styles.brandGrid}>
            {activeSystem.brands.map((brand) => {
              const isSelected = brand === selections[activeSystem.key];

              return (
                <Pressable
                  key={brand}
                  onPress={() =>
                    setSelections((current) => ({
                      ...current,
                      [activeSystem.key]: brand,
                    }))
                  }
                  style={[
                    styles.brandTile,
                    isSelected && styles.brandTileSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.brandTileText,
                      isSelected && styles.brandTileTextSelected,
                    ]}
                  >
                    {brand}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.outcomeGrid}>
          <View style={styles.outcomeCard}>
            <Text style={styles.panelEyebrow}>Live review preview</Text>
            {sampleAssessment.highlights.map((highlight) => (
              <View key={highlight} style={styles.checkRow}>
                <View style={styles.dot} />
                <Text style={styles.checkText}>{highlight}</Text>
              </View>
            ))}
          </View>

          <View style={styles.outcomeCard}>
            <Text style={styles.panelEyebrow}>Tertiary extras</Text>
            {tertiarySystems.map((system) => (
              <View key={system.key} style={styles.extraRow}>
                <Text style={styles.extraName}>{system.name}</Text>
                <Text style={styles.extraNote}>{system.note}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef3f7",
  },
  container: {
    paddingBottom: 36,
    padding: 24,
    gap: 24,
  },
  hero: {
    gap: 12,
    paddingTop: 16,
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d3e3ed",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  metricLabel: {
    color: "#587080",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metricValue: {
    color: "#11212d",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8,
  },
  eyebrow: {
    color: "#2a6f97",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#11212d",
    fontSize: 42,
    fontWeight: "800",
  },
  tagline: {
    color: "#214056",
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 30,
  },
  description: {
    color: "#476072",
    fontSize: 16,
    lineHeight: 24,
  },
  summaryCard: {
    alignItems: "center",
    backgroundColor: "#122b3a",
    borderColor: "#1c4258",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 20,
    justifyContent: "space-between",
  },
  panelEyebrow: {
    color: "#8fd4ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  panelTitle: {
    color: "#f4fbff",
    fontSize: 24,
    fontWeight: "700",
  },
  assessmentSummary: {
    color: "#bdd7e7",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 230,
  },
  scoreBadge: {
    alignItems: "center",
    backgroundColor: "#f4fbff",
    borderRadius: 22,
    minWidth: 90,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  scoreLabel: {
    color: "#2a6f97",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  scoreValue: {
    color: "#11212d",
    fontSize: 34,
    fontWeight: "800",
  },
  criteriaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  criteriaPill: {
    backgroundColor: "#d9ebf5",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  criteriaText: {
    color: "#24506a",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#fbfdff",
    borderColor: "#cfe0ec",
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  sectionTitle: {
    color: "#11212d",
    fontSize: 16,
    fontWeight: "700",
  },
  systemTabs: {
    gap: 12,
    paddingRight: 12,
  },
  systemTab: {
    backgroundColor: "#edf4f8",
    borderRadius: 22,
    gap: 6,
    padding: 16,
    width: 190,
  },
  systemTabActive: {
    backgroundColor: "#123244",
  },
  systemTabIndex: {
    color: "#6f8897",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  systemTabIndexActive: {
    color: "#8fd4ff",
  },
  systemTabTitle: {
    color: "#173244",
    fontSize: 16,
    fontWeight: "700",
  },
  systemTabTitleActive: {
    color: "#f4fbff",
  },
  systemTabValue: {
    color: "#476072",
    fontSize: 13,
    lineHeight: 18,
  },
  systemTabValueActive: {
    color: "#bdd7e7",
  },
  focusCard: {
    backgroundColor: "#fbfdff",
    borderColor: "#cfe0ec",
    borderRadius: 24,
    borderWidth: 1,
    gap: 18,
    padding: 20,
  },
  systemHeader: {
    gap: 12,
  },
  systemHeadingBlock: {
    gap: 6,
  },
  focusHeader: {
    gap: 14,
  },
  systemName: {
    color: "#11212d",
    fontSize: 20,
    fontWeight: "700",
  },
  systemNote: {
    color: "#4e6777",
    fontSize: 15,
    lineHeight: 22,
  },
  selectionBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e8f5d5",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectionLabel: {
    color: "#618227",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  selectionValue: {
    color: "#274c16",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  brandTile: {
    backgroundColor: "#edf4f8",
    borderRadius: 18,
    minWidth: "48%",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  brandTileSelected: {
    backgroundColor: "#2a6f97",
    borderColor: "#123244",
    borderWidth: 1,
  },
  brandTileText: {
    color: "#355160",
    fontSize: 14,
    fontWeight: "600",
  },
  brandTileTextSelected: {
    color: "#f4fbff",
  },
  outcomeGrid: {
    gap: 16,
  },
  outcomeCard: {
    backgroundColor: "#fffdf8",
    borderColor: "#e6dac4",
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  checkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  dot: {
    backgroundColor: "#d9a441",
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  checkText: {
    color: "#59462d",
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  extraRow: {
    gap: 4,
  },
  extraName: {
    color: "#513e23",
    fontSize: 15,
    fontWeight: "700",
  },
  extraNote: {
    color: "#6f5d45",
    fontSize: 14,
    lineHeight: 20,
  },
});
