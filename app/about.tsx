import { ScreenWrapper } from "@/components/screen-wrapper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper title="About Bugarin">
      <ScrollView className="flex-1 p-4">
        {/* App Icon and Name */}
        <View className="items-center mb-8">
          <View className="items-center justify-center w-20 h-20 mb-4 rounded-full bg-emerald-500/20">
            <Ionicons name="heart" size={40} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-white">Bugarin</Text>
          <Text className="text-sm text-neutral-400">Version 1.0.0</Text>
        </View>

        {/* Description */}
        <View className="p-4 mb-6 border bg-neutral-900 rounded-2xl border-neutral-800">
          <Text className="text-base leading-6 text-neutral-300">
            Bugarin is a simple health tracking app designed to help you monitor
            your fitness journey. Track your daily food intake, exercise
            activities, and weight changes to stay on top of your health goals.
          </Text>
        </View>

        {/* Features */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-white">Features</Text>
          <View className="gap-3">
            <View className="flex-row gap-3 p-3 border bg-neutral-900 rounded-xl border-neutral-800">
              <View className="pt-1">
                <Ionicons name="fast-food" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">Food Tracking</Text>
                <Text className="text-sm text-neutral-400">
                  Log meals and track calories and macros
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 p-3 border bg-neutral-900 rounded-xl border-neutral-800">
              <View className="pt-1">
                <Ionicons name="bicycle" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">Exercise Log</Text>
                <Text className="text-sm text-neutral-400">
                  Record workouts and burned calories
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 p-3 border bg-neutral-900 rounded-xl border-neutral-800">
              <View className="pt-1">
                <Ionicons name="scale" size={20} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">Weight Tracking</Text>
                <Text className="text-sm text-neutral-400">
                  Monitor weight changes and trends
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 p-3 border bg-neutral-900 rounded-xl border-neutral-800">
              <View className="pt-1">
                <Ionicons name="radio-button-on" size={20} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">Personal Targets</Text>
                <Text className="text-sm text-neutral-400">
                  Set and manage your health goals
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* About */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-white">About</Text>
          <View className="p-4 border bg-neutral-900 rounded-2xl border-neutral-800">
            <Text className="text-sm leading-6 text-neutral-300">
              Bugarin is built with the goal of making health tracking simple
              and accessible. Whether you're looking to lose weight, gain
              muscle, or just maintain a healthy lifestyle, Bugarin helps you
              keep track of your progress with ease.
            </Text>
            <Text className="mt-4 text-sm leading-6 text-neutral-300">
              All your data is stored locally on your device, ensuring your
              privacy and keeping your health information secure.
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View className="mb-8">
          <Text className="mb-3 text-lg font-bold text-white">Questions?</Text>
          <View className="p-4 border bg-neutral-900 rounded-2xl border-neutral-800">
            <Text className="text-sm text-neutral-400">
              For support or feedback, please reach out through your preferred
              contact method.
            </Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </ScreenWrapper>
  );
}
