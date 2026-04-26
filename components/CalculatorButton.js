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
      speed: 35,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.97)}
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
    opacity: 0.96,
  },
  button: {
    minHeight: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#020617",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 5,
  },
  text: {
    fontSize: 28,
    fontWeight: "700",
  },
  number: {
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderColor: "rgba(56, 189, 248, 0.14)",
  },
  operator: {
    backgroundColor: "rgba(8, 47, 73, 0.92)",
    borderColor: "rgba(34, 211, 238, 0.24)",
  },
  action: {
    backgroundColor: "rgba(69, 10, 10, 0.92)",
    borderColor: "rgba(248, 113, 113, 0.24)",
  },
  equals: {
    backgroundColor: "#06b6d4",
    borderColor: "rgba(165, 243, 252, 0.55)",
  },
  numberText: {
    color: "#e2e8f0",
  },
  operatorText: {
    color: "#67e8f9",
  },
  actionText: {
    color: "#fca5a5",
  },
  equalsText: {
    color: "#082f49",
  },
});
