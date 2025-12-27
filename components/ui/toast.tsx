import { useEffect } from "react";
import { Text } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, type, visible, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  const bgColor = type === "success" ? "bg-emerald-500" : "bg-red-500";

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={{ top: insets.top + 10 }}
      className={`absolute left-4 right-4 p-4 rounded-xl shadow-lg z-50 ${bgColor}`}
    >
      <Text className="text-white font-medium text-center">{message}</Text>
    </Animated.View>
  );
}
