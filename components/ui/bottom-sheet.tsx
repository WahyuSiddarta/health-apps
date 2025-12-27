import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

interface BottomSheetProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={onClose}
          />
          <View className="bg-neutral-900 rounded-t-3xl border-t border-neutral-800">
            <View className="flex-row justify-between items-center p-4 border-b border-neutral-800">
              <ThemedText type="subtitle">{title || ""}</ThemedText>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
            <View className="p-4 pb-8">{children}</View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
