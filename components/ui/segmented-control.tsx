import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

function SegmentedControlRow({
  options,
  value,
  onChange,
  isLast,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isLast: boolean;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  const isSelectedInRow = options.includes(value);
  const selectedIndex = options.indexOf(value);

  useEffect(() => {
    if (containerWidth > 0 && isSelectedInRow) {
      const tabWidth = containerWidth / options.length;
      translateX.value = withTiming(selectedIndex * tabWidth);
      opacity.value = withTiming(1);
    } else {
      opacity.value = withTiming(0);
    }
  }, [value, containerWidth, options, isSelectedInRow, selectedIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    const tabWidth = containerWidth / options.length;
    return {
      transform: [{ translateX: translateX.value }],
      width: tabWidth - 10,
      left: 5,
      opacity: opacity.value,
    };
  });

  return (
    <View
      className={`flex-row relative ${!isLast ? "border-b border-neutral-700" : ""}`}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        className="absolute top-1 bottom-1 bg-emerald-600 rounded-lg"
        style={animatedStyle}
      />
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          className="flex-1 py-3 items-center z-10"
        >
          <Text
            className={`${
              value === option ? "text-white" : "text-neutral-400"
            } font-semibold text-center`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps) {
  const rows = [];
  for (let i = 0; i < options.length; i += 3) {
    rows.push(options.slice(i, i + 3));
  }

  return (
    <View className={className}>
      {label && (
        <Text className="text-neutral-400 mb-2 text-sm font-medium">
          {label}
        </Text>
      )}
      <View className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
        {rows.map((rowOptions, index) => (
          <SegmentedControlRow
            key={index}
            options={rowOptions}
            value={value}
            onChange={onChange}
            isLast={index === rows.length - 1}
          />
        ))}
      </View>
    </View>
  );
}
