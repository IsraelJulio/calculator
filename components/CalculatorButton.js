import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

export default function CalculatorButton({
  label,
  onPress,
  variant = "number",
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.96)}
      onPressOut={() => animateTo(1)}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
      ]}
    >
      <Animated.View
        style={[
          styles.button,
          styles[variant],
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    margin: 6,
  },
  pressed: {
    opacity: 0.9,
  },
  button: {
    minHeight: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  text: {
    fontSize: 28,
    fontWeight: "700",
  },
  number: {
    backgroundColor: "#ffffff",
  },
  operator: {
    backgroundColor: "#dbeafe",
  },
  action: {
    backgroundColor: "#fee2e2",
  },
  equals: {
    backgroundColor: "#2563eb",
  },
  numberText: {
    color: "#0f172a",
  },
  operatorText: {
    color: "#1d4ed8",
  },
  actionText: {
    color: "#dc2626",
  },
  equalsText: {
    color: "#ffffff",
  },
});
