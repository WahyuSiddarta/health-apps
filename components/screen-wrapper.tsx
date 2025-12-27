import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

interface ScreenWrapperProps {
  title: string;
  children?: React.ReactNode;
}

export function ScreenWrapper({ title, children }: ScreenWrapperProps) {
  return (
    <LinearGradient
      colors={["#022c22", "#000000"]} // Emerald 950 to Black
      className="flex-1"
    >
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 py-4 border-b border-white/10">
          <Text className="text-3xl font-bold text-primary">{title}</Text>
        </View>
        <View className="flex-1">{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}
