import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

interface ChartCardProps {
	labels: string[];
	data: number[] | [number[], number[]]; // Soporta una o dos series
	color?: string | [string, string];
	height?: number;
}

const screenWidth = Dimensions.get('window').width;

export function ChartCard({ labels, data, color = '#9C27B0', height = 220 }: ChartCardProps) {
	let ingresos: number[] = [];
	let gastos: number[] = [];
	let isGrouped = false;
	let barColor1 = typeof color === 'string' ? color : color?.[0] || '#4caf50';
	let barColor2 = typeof color === 'string' ? '#f44336' : color?.[1] || '#f44336';

	if (Array.isArray(data) && Array.isArray(data[0])) {
		// data: [ingresos[], gastos[]]
		ingresos = data[0] as number[];
		gastos = data[1] as number[];
		isGrouped = true;
	} else {
		ingresos = data as number[];
	}
	const max = isGrouped ? Math.max(...ingresos, ...gastos, 1) : Math.max(...ingresos, 1);
	const padding = 16;
	const chartWidth = Math.max(screenWidth - 40, 200);
	const barCount = ingresos.length || 1;
	const gap = 8;
	const groupGap = isGrouped ? 4 : 0;
	const barWidth = isGrouped
		? (chartWidth - padding * 2 - gap * (barCount - 1)) / barCount / 2
		: (chartWidth - padding * 2 - gap * (barCount - 1)) / barCount;

	return (
		<View style={styles.card}>
			<Svg width={chartWidth} height={height}>
				{ingresos.map((value, i) => {
					const scaledHeight = (value / max) * (height - 40);
					const x = padding + i * ((isGrouped ? 2 : 1) * barWidth + gap);
					const y = height - scaledHeight - 20;
					return (
						<>
							<Rect
								key={`bar-ingreso-${i}`}
								x={x}
								y={y}
								rx={6}
								width={barWidth - groupGap}
								height={scaledHeight}
								fill={barColor1}
							/>
							<SvgText
								x={x + (barWidth - groupGap) / 2}
								y={y - 4}
								fontSize="12"
								fill="#fff"
								textAnchor="middle"
							>
								{value}
							</SvgText>
						</>
					);
				})}
				{isGrouped && gastos.map((value, i) => {
					const scaledHeight = (value / max) * (height - 40);
					const x = padding + i * (2 * barWidth + gap) + barWidth;
					const y = height - scaledHeight - 20;
					return (
						<>
							<Rect
								key={`bar-gasto-${i}`}
								x={x}
								y={y}
								rx={6}
								width={barWidth - groupGap}
								height={scaledHeight}
								fill={barColor2}
							/>
							<SvgText
								x={x + (barWidth - groupGap) / 2}
								y={y - 4}
								fontSize="12"
								fill="#fff"
								textAnchor="middle"
							>
								{value}
							</SvgText>
						</>
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
