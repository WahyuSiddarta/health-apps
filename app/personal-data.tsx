import { ScreenWrapper } from "@/components/screen-wrapper";
import { InputField } from "@/components/ui/input-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/context/toast-context";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "@/database/operations";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PersonalDataScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<"weight_loss" | "weight_gain" | "maintain">(
    "weight_loss",
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const userProfile = getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setName(userProfile.name);
        setAge(userProfile.age.toString());
        setGender(userProfile.gender);
        setHeight(userProfile.height_cm.toString());
        setGoal(userProfile.goal);
      }
    } catch (error) {
      console.error(error);
      showToast(t("pages.personalData.failedLoadProfile"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!profile) return;
    try {
      updateUserProfile(profile.user_id, {
        name,
        age: Number(age),
        gender,
        height_cm: Number(height),
        goal,
      });

      showToast(t("pages.personalData.profileUpdatedSuccess"), "success");
      router.back();
    } catch (error) {
      console.error(error);
      showToast(t("pages.personalData.failedUpdateProfile"), "error");
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title={t("pages.personalData.title")}>
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={t("pages.personalData.title")} showBackButton>
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="mb-4 text-xl font-bold text-white">
            {t("pages.personalData.basicInformation")}
          </Text>
          <View className="gap-4">
            <InputField
              label={t("pages.personalData.name")}
              value={name}
              onChangeText={setName}
              placeholder={t("pages.onboarding.namePlaceholder")}
            />
            <InputField
              label={t("pages.personalData.age")}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="0"
            />
            <InputField
              label={t("pages.personalData.height")}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>

        <View className="mb-8">
          <SegmentedControl
            label={t("pages.personalData.gender")}
            options={[t("pages.onboarding.male"), t("pages.onboarding.female")]}
            value={
              gender === "male"
                ? t("pages.onboarding.male")
                : t("pages.onboarding.female")
            }
            onChange={(displayValue) => {
              if (displayValue === t("pages.onboarding.male")) {
                setGender("male");
              } else {
                setGender("female");
              }
            }}
          />
        </View>

        <View className="mb-20">
          <SegmentedControl
            label={t("pages.personalData.mainGoal")}
            options={[
              t("pages.personalTarget.weightLoss"),
              t("pages.personalTarget.weightGain"),
              t("pages.personalTarget.maintain"),
            ]}
            value={
              goal === "weight_loss"
                ? t("pages.personalTarget.weightLoss")
                : goal === "weight_gain"
                  ? t("pages.personalTarget.weightGain")
                  : t("pages.personalTarget.maintain")
            }
            onChange={(displayValue) => {
              if (displayValue === t("pages.personalTarget.weightLoss")) {
                setGoal("weight_loss");
              } else if (
                displayValue === t("pages.personalTarget.weightGain")
              ) {
                setGoal("weight_gain");
              } else {
                setGoal("maintain");
              }
            }}
          />
        </View>
      </ScrollView>

      <View
        className="p-4 border-t border-white/10 bg-black/50"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          onPress={handleSave}
          className="items-center justify-center p-4 rounded-xl bg-primary"
        >
          <Text className="text-lg font-bold text-white">
            {t("pages.personalData.saveChanges")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
