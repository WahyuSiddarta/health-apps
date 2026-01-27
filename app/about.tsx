import { ScreenWrapper } from "@/components/screen-wrapper";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function AboutScreen() {
  const { t } = useTranslation();

  const handleCopyEmail = async () => {
    const email = t("pages.about.email");
    await Clipboard.setStringAsync(email);
    Alert.alert("Copied", `${email} copied to clipboard`);
  };

  return (
    <ScreenWrapper title={t("pages.about.title")} showBackButton>
      <ScrollView className="flex-1 p-4">
        {/* App Icon and Name */}
        <View className="items-center mb-8">
          <View className="items-center justify-center w-20 h-20 mb-4 rounded-full bg-emerald-500/20">
            <Ionicons name="heart" size={40} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-white">Bugarin</Text>
          <Text className="text-sm text-neutral-400">
            {t("pages.about.version")}
          </Text>
        </View>

        {/* Description */}
        <View className="p-4 mb-6 border bg-neutral-900 rounded-2xl border-neutral-800">
          <Text className="text-base leading-6 text-neutral-300">
            {t("pages.about.description")}
          </Text>
        </View>

        {/* Features */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-white">
            {t("pages.about.features")}
          </Text>
          <View className="gap-3">
            <View className="flex-row gap-3 p-3 border bg-neutral-900 rounded-xl border-neutral-800">
              <View className="pt-1">
                <Ionicons name="fast-food" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">
                  {t("pages.about.foodTracking")}
                </Text>
                <Text className="text-sm text-neutral-400">
                  {t("pages.about.foodTrackingDesc")}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 p-3 border bg-neutral-900 rounded-xl border-neutral-800">
              <View className="pt-1">
                <Ionicons name="bicycle" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">
                  {t("pages.about.exerciseLog")}
                </Text>
                <Text className="text-sm text-neutral-400">
                  {t("pages.about.exerciseLogDesc")}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 p-3 border bg-neutral-900 rounded-xl border-neutral-800">
              <View className="pt-1">
                <Ionicons name="scale" size={20} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">
                  {t("pages.about.weightTracking")}
                </Text>
                <Text className="text-sm text-neutral-400">
                  {t("pages.about.weightTrackingDesc")}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 p-3 border bg-neutral-900 rounded-xl border-neutral-800">
              <View className="pt-1">
                <Ionicons name="radio-button-on" size={20} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">
                  {t("pages.about.personalTargets")}
                </Text>
                <Text className="text-sm text-neutral-400">
                  {t("pages.about.personalTargetsDesc")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* About */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-white">
            {t("pages.about.aboutTitle")}
          </Text>
          <View className="p-4 border bg-neutral-900 rounded-2xl border-neutral-800">
            <Text className="text-sm leading-6 text-neutral-300">
              {t("pages.about.aboutText1")}
            </Text>
            <Text className="mt-4 text-sm leading-6 text-neutral-300">
              {t("pages.about.aboutText2")}
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View className="mb-8">
          <Text className="mb-3 text-lg font-bold text-white">
            {t("pages.about.contactTitle")}
          </Text>
          <View className="p-4 border bg-neutral-900 rounded-2xl border-neutral-800">
            <Text className="mb-2 text-sm text-neutral-400">
              {t("pages.about.contactText")}
            </Text>
            <TouchableOpacity
              onPress={handleCopyEmail}
              className="flex-row items-center gap-2"
            >
              <Text className="text-sm font-medium text-blue-500">
                {t("pages.about.email")}
              </Text>
              <Ionicons name="copy" size={14} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </ScreenWrapper>
  );
}
