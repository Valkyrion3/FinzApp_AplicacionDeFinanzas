import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface ChartCardProps {
  labels: string[];
  data: number[];
  color?: string;
  height?: number;
}

const screenWidth = Dimensions.get('window').width;

export default function ChartCard({ labels, data, color = '#9C27B0', height = 220 }: ChartCardProps) {
  const max = Math.max(...data, 1);
  const padding = 16;
  const chartWidth = Math.max(screenWidth - 40, 200);
  const barCount = data.length || 1;
  const gap = 8;
  const barWidth = (chartWidth - padding * 2 - gap * (barCount - 1)) / barCount;

  return (
    <View style={styles.card}>
      <Svg width={chartWidth} height={height}>
        {data.map((value, i) => {
          const scaledHeight = (value / max) * (height - 40); // leave room for top padding
          const x = padding + i * (barWidth + gap);
          const y = height - scaledHeight - 20; // bottom padding for labels
          return (
            <Rect
              key={`bar-${i}`}
              x={x}
              y={y}
              rx={6}
              width={barWidth}
              height={scaledHeight}
              fill={color}
            />
          );
        })}
      </Svg>

      <View style={styles.labelsRow}>
        {labels.map((label, i) => (
          <Text style={styles.labelText} key={`label-${i}`} numberOfLines={1} ellipsizeMode="tail">
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    marginVertical: 16,
    borderRadius: 12,
  },
  labelsRow: {
    width: screenWidth - 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
});
