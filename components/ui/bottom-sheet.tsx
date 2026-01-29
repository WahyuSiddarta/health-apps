import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  ScrollView,
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        console.log("Keyboard frame changed:", e.endCoordinates.height);
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      },
    );
    const changeSubscription = Keyboard.addListener(
      Platform.OS === "ios"
        ? "keyboardWillChangeFrame"
        : "keyboardDidChangeFrame",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      changeSubscription.remove();
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="justify-end flex-1 bg-black/50">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          className="border-t bg-neutral-900 rounded-t-3xl border-neutral-800 max-h-[90%]"
          style={{ marginBottom: keyboardHeight }}
        >
          <View className="flex-row items-center justify-between p-4 border-b border-neutral-800">
            <ThemedText type="subtitle">{title || ""}</ThemedText>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#a3a3a3" />
            </TouchableOpacity>
          </View>
          <ScrollView
            className="p-4 pb-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
