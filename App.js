import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import CalculatorButton from "./components/CalculatorButton";

const BUTTON_ROWS = [
  [
    { label: "7", type: "number" },
    { label: "8", type: "number" },
    { label: "9", type: "number" },
    { label: "/", type: "operator" },
  ],
  [
    { label: "4", type: "number" },
    { label: "5", type: "number" },
    { label: "6", type: "number" },
    { label: "*", type: "operator" },
  ],
  [
    { label: "1", type: "number" },
    { label: "2", type: "number" },
    { label: "3", type: "number" },
    { label: "-", type: "operator" },
  ],
  [
    { label: "0", type: "number" },
    { label: "C", type: "action" },
    { label: "=", type: "equals" },
    { label: "+", type: "operator" },
  ],
];

const operators = ["+", "-", "*", "/"];

const formatNumber = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Error";
  }

  const formatted = Number.isInteger(numericValue)
    ? numericValue.toString()
    : numericValue.toFixed(10).replace(/\.?0+$/, "");

  return formatted;
};

export default function App() {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const [currentInput, setCurrentInput] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [result, setResult] = useState("");

  const expressionText = useMemo(() => {
    if (previousValue !== null && selectedOperator) {
      return currentInput
        ? `${formatNumber(previousValue)} ${selectedOperator} ${currentInput}`
        : `${formatNumber(previousValue)} ${selectedOperator}`;
    }

    return currentInput || "0";
  }, [currentInput, previousValue, selectedOperator]);

  const clearAll = () => {
    setCurrentInput("0");
    setPreviousValue(null);
    setSelectedOperator(null);
    setResult("");
  };

  const appendNumber = (value) => {
    if (result === "Cannot divide by zero" || result === "Error") {
      setResult("");
      setPreviousValue(null);
      setSelectedOperator(null);
      setCurrentInput(value);
      return;
    }

    if (result && !selectedOperator && currentInput === result) {
      setCurrentInput(value);
      setPreviousValue(null);
      setResult("");
      return;
    }

    setCurrentInput((prev) => {
      if (prev === "0" || prev === "") {
        return value;
      }

      return `${prev}${value}`;
    });
    setResult("");
  };

  const appendDecimal = () => {
    if (result === "Cannot divide by zero" || result === "Error") {
      setCurrentInput("0.");
      setResult("");
      setPreviousValue(null);
      setSelectedOperator(null);
      return;
    }

    if (result && !selectedOperator && currentInput === result) {
      setCurrentInput("0.");
      setPreviousValue(null);
      setResult("");
      return;
    }

    setCurrentInput((prev) => {
      if (prev === "") {
        return "0.";
      }

      if (prev.includes(".")) {
        return prev;
      }

      return `${prev}.`;
    });
    setResult("");
  };

  const performCalculation = (left, right, operator) => {
    switch (operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        if (right === 0) {
          return null;
        }
        return left / right;
      default:
        return right;
    }
  };

  const handleOperator = (operator) => {
    if (currentInput === "Error") {
      return;
    }

    const currentValue = Number(currentInput);

    if (Number.isNaN(currentValue)) {
      return;
    }

    if (previousValue !== null && selectedOperator) {
      if (currentInput === "") {
        setSelectedOperator(operator);
        return;
      }

      const calculatedValue = performCalculation(
        previousValue,
        currentValue,
        selectedOperator
      );

      if (calculatedValue === null) {
        setResult("Cannot divide by zero");
        setCurrentInput("0");
        setPreviousValue(null);
        setSelectedOperator(null);
        return;
      }

      const formattedValue = formatNumber(calculatedValue);
      setPreviousValue(calculatedValue);
      setResult(formattedValue);
    } else {
      setPreviousValue(currentValue);
    }

    setSelectedOperator(operator);
    setCurrentInput("");
  };

  const handleEquals = () => {
    if (previousValue === null || !selectedOperator) {
      setResult(formatNumber(currentInput || "0"));
      setCurrentInput(currentInput || "0");
      return;
    }

    if (currentInput === "") {
      setResult(formatNumber(previousValue));
      setCurrentInput(formatNumber(previousValue));
      setSelectedOperator(null);
      return;
    }

    const currentValue = Number(currentInput);
    const calculatedValue = performCalculation(
      previousValue,
      currentValue,
      selectedOperator
    );

    if (calculatedValue === null) {
      setResult("Cannot divide by zero");
      setCurrentInput("0");
      setPreviousValue(null);
      setSelectedOperator(null);
      return;
    }

    const formattedValue = formatNumber(calculatedValue);
    setCurrentInput(formattedValue);
    setPreviousValue(calculatedValue);
    setSelectedOperator(null);
    setResult(formattedValue);
  };

  const handleButtonPress = (label) => {
    if (/^\d$/.test(label)) {
      appendNumber(label);
      return;
    }

    if (label === ".") {
      appendDecimal();
      return;
    }

    if (operators.includes(label)) {
      handleOperator(label);
      return;
    }

    if (label === "=") {
      handleEquals();
      return;
    }

    if (label === "C") {
      clearAll();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={[styles.card, isCompact && styles.cardCompact]}>
          <Text style={styles.title}>SimpleCalculator</Text>

          <View style={styles.display}>
            <Text
              style={styles.expressionText}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {expressionText}
            </Text>
            <Text
              style={[styles.resultText, isCompact && styles.resultTextCompact]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {result || currentInput}
            </Text>
          </View>

          <View style={styles.grid}>
            {BUTTON_ROWS.map((row, rowIndex) => (
              <View style={styles.row} key={`row-${rowIndex}`}>
                {row.map((button) => (
                  <CalculatorButton
                    key={button.label}
                    label={button.label}
                    variant={button.type}
                    onPress={() => handleButtonPress(button.label)}
                  />
                ))}
              </View>
            ))}

            <View style={styles.row}>
              <CalculatorButton
                label="."
                variant="number"
                onPress={() => handleButtonPress(".")}
              />
              <View style={styles.placeholder} />
              <View style={styles.placeholder} />
              <View style={styles.placeholder} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e0f2fe",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#e0f2fe",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#f8fafc",
    borderRadius: 28,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  cardCompact: {
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  display: {
    minHeight: 140,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: "space-between",
    marginBottom: 18,
  },
  expressionText: {
    fontSize: 22,
    color: "#93c5fd",
    textAlign: "right",
  },
  resultText: {
    fontSize: 44,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "right",
  },
  resultTextCompact: {
    fontSize: 36,
  },
  grid: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
  },
  placeholder: {
    flex: 1,
    margin: 6,
  },
});
