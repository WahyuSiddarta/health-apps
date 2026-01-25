import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  title: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
}

export function ScreenWrapper({
  title,
  children,
  showBackButton,
}: ScreenWrapperProps) {
  const router = useRouter();
  return (
    <LinearGradient
      colors={["#022c22", "#000000"]} // Emerald 950 to Black
      className="flex-1"
    >
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-row items-center gap-4 px-6 pb-4 border-b border-white/10">
          {showBackButton && (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#10b981" />
            </TouchableOpacity>
          )}
          <Text className="text-3xl font-bold text-primary">{title}</Text>
        </View>
        {children ? <View className="flex-1">{children}</View> : null}
      </SafeAreaView>
    </LinearGradient>
  );
}
