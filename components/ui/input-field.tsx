import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputFieldProps extends TextInputProps {
  label: string;
  className?: string;
  useThousandSeparator?: boolean;
  required?: boolean;
}

export function InputField({
  label,
  className,
  useThousandSeparator,
  required,
  value,
  onChangeText,
  ...props
}: InputFieldProps) {
  const formatNumber = (num: string) => {
    if (!num) return "";
    const cleanNum = num.replace(/,/g, "");
    const parts = cleanNum.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleChangeText = (text: string) => {
    if (useThousandSeparator && onChangeText) {
      const rawValue = text.replace(/,/g, "");
      onChangeText(rawValue);
    } else if (onChangeText) {
      onChangeText(text);
    }
  };

  const displayValue =
    useThousandSeparator && value ? formatNumber(value) : value;

  return (
    <View className={className}>
      <Text className="text-neutral-400 mb-2 text-sm font-medium">
        {label}
        {required !== undefined &&
          (required ? (
            <Text className="text-red-500"> *</Text>
          ) : (
            <Text className="text-neutral-500 text-xs"> (optional)</Text>
          ))}
      </Text>
      <TextInput
        className="bg-neutral-800 text-white px-3 py-2 rounded-xl border border-neutral-700"
        placeholderTextColor="#737373"
        value={displayValue}
        onChangeText={handleChangeText}
        {...props}
      />
    </View>
  );
}
