import { ExpoConfig } from "@expo/config-types";

module.exports = ({ config }: { config: ExpoConfig }) => ({
  ...config,
  plugins: [
    [
      "@revopush/expo-code-push-plugin",
      {
        ios: {
          CodePushDeploymentKey: "ma64ruk3sAGdYQNKhM_btwaMrWMuV1793obU7g",
          CodePushServerUrl: "https://api.revopush.org",
        },
        android: {
          CodePushDeploymentKey: "ma64ruk3sAGdYQNKhM_btwaMrWMuV1793obU7g",
          CodePushServerUrl: "https://api.revopush.org",
        },
      },
    ],
  ],
});
