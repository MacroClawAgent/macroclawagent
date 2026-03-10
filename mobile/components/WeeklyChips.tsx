import { View, Text, StyleSheet } from "react-native";

interface ChipDay {
  date: string;
  day: string;
  kcal: number;
  target: number;
}

interface WeeklyChipsProps {
  days: ChipDay[];
  primary: string;
  primaryText: string;
}

export function WeeklyChips({ days, primary, primaryText }: WeeklyChipsProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <View style={styles.row}>
      {days.map((d) => {
        const isToday = d.date === today;
        const hit = d.kcal > 0 && d.kcal >= d.target * 0.85;
        const ringColor = hit ? primary : "rgba(255,255,255,0.18)";

        return (
          <View key={d.date} style={styles.chip}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: isToday ? primary : "transparent",
                  borderColor: isToday ? primary : ringColor,
                  borderWidth: 1.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.letter,
                  { color: isToday ? primaryText : hit ? primary : "rgba(245,245,247,0.4)" },
                ]}
              >
                {d.day[0]}
              </Text>
            </View>
            {d.kcal > 0 && !isToday && (
              <View style={[styles.dot, { backgroundColor: hit ? primary : "rgba(255,255,255,0.2)" }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingTop: 4 },
  chip: { alignItems: "center", gap: 4 },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  letter: { fontSize: 13, fontWeight: "700" },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
