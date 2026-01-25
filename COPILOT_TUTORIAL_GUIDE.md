# React Native Copilot Tutorial Implementation Guide

## Overview

Your Health app now has an interactive onboarding tutorial using `react-native-copilot`. This guides new users through the key features of the application.

## Features Implemented

### 1. **CopilotProvider Context** (`/context/copilot-context.tsx`)

- Wraps your entire app with the CopilotProvider
- Custom styled tooltips with dark theme matching your app design
- Backdrop overlay with configurable opacity

### 2. **Tutorial Hook** (`/hooks/use-copilot-tutorial.ts`)

- `useCopilotTutorial()` - Custom hook to manage tutorial state
- Persists tutorial completion status using AsyncStorage
- Functions:
  - `startTutorial()` - Starts the tutorial
  - `completeTutorial()` - Marks tutorial as completed
  - `resetTutorial()` - Resets tutorial progress
  - `checkTutorialStatus()` - Checks if user completed tutorial
  - `isTutorialCompleted` - State boolean
  - `isCheckingTutorial` - Loading state

### 3. **Tutorial Steps** (`/components/onboarding-tutorial.tsx`)

- **CalorieCardStep** - Explains daily calorie tracking
- **WeightProgressStep** - Weight tracking overview
- **ExerciseTabStep** - How to log workouts
- **FoodTabStep** - How to log meals
- **SettingsTabStep** - Accessing preferences

### 4. **Dashboard Integration** (`/app/(tabs)/index.tsx`)

- Tutorial automatically starts for first-time users
- Help button to manually start tutorial
- 5 tutorial steps highlighting key features
- Each step provides context-aware guidance

### 5. **Settings Page** (`/app/(tabs)/settings.tsx`)

- "Start Tutorial" button - Manually restart the tutorial
- "Reset Tutorial Progress" button - Reset completion status
- Success notification when tutorial is reset

## How It Works

### First-Time User Flow:

1. User launches the app for the first time
2. Dashboard checks if tutorial was completed
3. If not, tutorial automatically starts after 1 second
4. User is guided through 5 steps highlighting:
   - Calorie tracking
   - Weight monitoring
   - Exercise logging
   - Food logging
   - Settings access

### User Can:

- **Continue** - Go to next step
- **Skip** - Skip the entire tutorial
- **Revisit** - Restart from Settings > "Start Tutorial"
- **Reset** - Reset progress to show again next app launch

## Installation Requirements

Make sure you have installed the required dependencies:

```bash
npm install react-native-copilot @react-native-async-storage/async-storage
# or
yarn add react-native-copilot @react-native-async-storage/async-storage
```

## Usage Examples

### Start Tutorial Programmatically:

```tsx
import { useCopilotTutorial } from "@/hooks/use-copilot-tutorial";

const { startTutorial } = useCopilotTutorial();

// Start the tutorial
<TouchableOpacity onPress={startTutorial}>
  <Text>Start Tutorial</Text>
</TouchableOpacity>;
```

### Add Custom Tutorial Step:

```tsx
import { CopilotStep } from "react-native-copilot";

<CopilotStep text="This is a tutorial step" order={1} name="step_name">
  <View>{/* Your component here */}</View>
</CopilotStep>;
```

## File Structure

```
├── context/
│   └── copilot-context.tsx          # CopilotProvider wrapper
├── hooks/
│   └── use-copilot-tutorial.ts      # Tutorial state management
├── components/
│   ├── onboarding-tutorial.tsx      # Tutorial components
│   └── copilot-wrapper.tsx          # Copilot event handlers
├── app/
│   ├── _layout.tsx                  # Updated with CopilotProvider
│   └── (tabs)/
│       ├── index.tsx                # Dashboard with tutorial steps
│       └── settings.tsx             # Updated with tutorial controls
```

## Customization

### Change Tutorial Text:

Edit the `text` prop in `CopilotStep` components:

```tsx
<CopilotStep
  text="Your custom guidance text here"
  order={1}
  name="step_name"
>
```

### Modify Tooltip Styling:

In `/context/copilot-context.tsx`, update the `CustomTooltip` component:

```tsx
const CustomTooltip = () => {
  return (
    <Tooltip
      backgroundColor="#your-color" // Change background
      borderRadius={12}
      labelStyle={{
        color: "#your-text-color",
        fontSize: 14,
      }}
      arrowColor="#your-color"
    />
  );
};
```

### Change Backdrop Color:

In `/context/copilot-context.tsx`:

```tsx
<CopilotProvider
  backdropColor="rgba(0, 0, 0, 0.5)"  // Adjust opacity
>
```

## Storage Key

Tutorial completion status is stored in AsyncStorage with key:

```
"copilot_tutorial_completed"
```

To clear programmatically:

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
await AsyncStorage.removeItem("copilot_tutorial_completed");
```

## Troubleshooting

### Tutorial Not Starting:

1. Ensure all components are rendered before calling `startTutorial()`
2. Check that `CopilotProvider` wraps your entire app
3. Verify AsyncStorage is properly initialized

### Steps Not Highlighting:

1. Ensure `CopilotStep` components wrap the target elements
2. Check that `name` prop is unique for each step
3. Verify `order` prop is sequential

### Performance Issues:

1. Use `useCallback` for tutorial functions
2. Delay tutorial start with `setTimeout`
3. Consider removing tutorial for very large screens

## Next Steps

1. **Test** - Run the app and verify tutorial works on first launch
2. **Customize** - Adjust tutorial text and styling to match your branding
3. **Expand** - Add more tutorial steps for other screens (Food, Exercise, Weight tabs)
4. **Analytics** - Track tutorial completion rates for analytics

## Notes

- Tutorial persists across app sessions using AsyncStorage
- Users can reset tutorial anytime from Settings
- Tutorial is non-intrusive and can be skipped at any time
- All tutorial data is local to the device

---

For more details on react-native-copilot, visit: https://github.com/mohebifar/react-native-copilot
