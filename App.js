import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import CalculatorButton from "./components/CalculatorButton";

const BUTTON_ROWS = [
  [
    { label: "(", type: "operator" },
    { label: ")", type: "operator" },
    { label: "[", type: "operator" },
    { label: "]", type: "operator" },
  ],
  [
    { label: "{", type: "operator" },
    { label: "}", type: "operator" },
    { label: "C", type: "action" },
    { label: "/", type: "operator" },
  ],
  [
    { label: "7", type: "number" },
    { label: "8", type: "number" },
    { label: "9", type: "number" },
    { label: "*", type: "operator" },
  ],
  [
    { label: "4", type: "number" },
    { label: "5", type: "number" },
    { label: "6", type: "number" },
    { label: "-", type: "operator" },
  ],
  [
    { label: "1", type: "number" },
    { label: "2", type: "number" },
    { label: "3", type: "number" },
    { label: "+", type: "operator" },
  ],
  [
    { label: "0", type: "number" },
    { label: ".", type: "number" },
    { label: "=", type: "equals" },
  ],
];

const operators = ["+", "-", "*", "/"];
const openingBrackets = ["(", "[", "{"];
const closingBrackets = [")", "]", "}"];
const bracketPairs = {
  ")": "(",
  "]": "[",
  "}": "{",
};

const formatNumber = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Error";
  }

  return Number.isInteger(numericValue)
    ? numericValue.toString()
    : numericValue.toFixed(10).replace(/\.?0+$/, "");
};

const tokenize = (expression) => {
  const tokens = [];
  let currentNumber = "";

  for (const char of expression) {
    if (/\d|\./.test(char)) {
      currentNumber += char;
      continue;
    }

    if (currentNumber) {
      tokens.push(currentNumber);
      currentNumber = "";
    }

    if (operators.includes(char) || openingBrackets.includes(char) || closingBrackets.includes(char)) {
      tokens.push(char);
    }
  }

  if (currentNumber) {
    tokens.push(currentNumber);
  }

  return tokens;
};

const precedence = (operator) => {
  if (operator === "+" || operator === "-") {
    return 1;
  }

  if (operator === "*" || operator === "/") {
    return 2;
  }

  return 0;
};

const toRpn = (tokens) => {
  const output = [];
  const stack = [];

  for (const token of tokens) {
    if (!Number.isNaN(Number(token))) {
      output.push(token);
      continue;
    }

    if (operators.includes(token)) {
      while (
        stack.length > 0 &&
        operators.includes(stack[stack.length - 1]) &&
        precedence(stack[stack.length - 1]) >= precedence(token)
      ) {
        output.push(stack.pop());
      }

      stack.push(token);
      continue;
    }

    if (openingBrackets.includes(token)) {
      stack.push(token);
      continue;
    }

    if (closingBrackets.includes(token)) {
      while (
        stack.length > 0 &&
        !openingBrackets.includes(stack[stack.length - 1])
      ) {
        output.push(stack.pop());
      }

      if (stack.length === 0 || stack[stack.length - 1] !== bracketPairs[token]) {
        throw new Error("Agrupamento invalido");
      }

      stack.pop();
    }
  }

  while (stack.length > 0) {
    const token = stack.pop();

    if (openingBrackets.includes(token)) {
      throw new Error("Agrupamento invalido");
    }

    output.push(token);
  }

  return output;
};

const evaluateRpn = (tokens) => {
  const stack = [];

  for (const token of tokens) {
    if (!Number.isNaN(Number(token))) {
      stack.push(Number(token));
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();

    if (left === undefined || right === undefined) {
      throw new Error("Expressao invalida");
    }

    switch (token) {
      case "+":
        stack.push(left + right);
        break;
      case "-":
        stack.push(left - right);
        break;
      case "*":
        stack.push(left * right);
        break;
      case "/":
        if (right === 0) {
          throw new Error("Cannot divide by zero");
        }
        stack.push(left / right);
        break;
      default:
        throw new Error("Expressao invalida");
    }
  }

  if (stack.length !== 1) {
    throw new Error("Expressao invalida");
  }

  return stack[0];
};

const evaluateExpression = (expression) => {
  const normalized = expression.replace(/\s+/g, "");

  if (!normalized) {
    return "0";
  }

  const tokens = tokenize(normalized);
  const rpn = toRpn(tokens);
  const result = evaluateRpn(rpn);
  return formatNumber(result);
};

const HISTORY_LIMIT = 5;

export default function App() {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const [currentInput, setCurrentInput] = useState("0");
  const [previousValue, setPreviousValue] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);

  const displayExpression = useMemo(() => {
    return currentInput || "0";
  }, [currentInput]);

  const lastCharacter = currentInput.slice(-1);

  const clearAll = () => {
    setCurrentInput("0");
    setPreviousValue("");
    setSelectedOperator("");
    setResult("");
  };

  const appendDigit = (digit) => {
    if (result && currentInput === result) {
      setCurrentInput(digit);
      setPreviousValue("");
      setSelectedOperator("");
      setResult("");
      return;
    }

    setCurrentInput((prev) => {
      if (prev === "0") {
        return digit;
      }

      if (closingBrackets.includes(prev.slice(-1))) {
        return prev;
      }

      return `${prev}${digit}`;
    });
    setResult("");
  };

  const appendDecimal = () => {
    if (result && currentInput === result) {
      setCurrentInput("0.");
      setPreviousValue("");
      setSelectedOperator("");
      setResult("");
      return;
    }

    const tokens = tokenize(currentInput);
    const lastToken = tokens[tokens.length - 1] || "";

    if (lastToken.includes(".")) {
      return;
    }

    setCurrentInput((prev) => {
      if (prev === "0" || operators.includes(prev.slice(-1)) || openingBrackets.includes(prev.slice(-1))) {
        return prev === "0" ? "0." : `${prev}0.`;
      }

      if (closingBrackets.includes(prev.slice(-1))) {
        return prev;
      }

      return `${prev}.`;
    });
    setResult("");
  };

  const appendOperator = (operator) => {
    if (currentInput === "0" && operator !== "-") {
      return;
    }

    if (openingBrackets.includes(operator)) {
      setCurrentInput((prev) => {
        if (prev === "0") {
          return operator;
        }

        if (/\d/.test(prev.slice(-1)) || closingBrackets.includes(prev.slice(-1))) {
          return prev;
        }

        return `${prev}${operator}`;
      });
      setResult("");
      return;
    }

    if (closingBrackets.includes(operator)) {
      const openCount = [...currentInput].filter((char) => bracketPairs[operator] === char).length;
      const closeCount = [...currentInput].filter((char) => char === operator).length;

      if (
        openCount <= closeCount ||
        operators.includes(lastCharacter) ||
        openingBrackets.includes(lastCharacter)
      ) {
        return;
      }

      setCurrentInput((prev) => `${prev}${operator}`);
      setResult("");
      return;
    }

    setCurrentInput((prev) => {
      if (result && prev === result) {
        setPreviousValue(result);
      }

      if (operators.includes(prev.slice(-1))) {
        return `${prev.slice(0, -1)}${operator}`;
      }

      if (openingBrackets.includes(prev.slice(-1))) {
        return prev;
      }

      return `${prev}${operator}`;
    });

    setSelectedOperator(operator);
    setResult("");
  };

  const handleEquals = () => {
    try {
      const calculated = evaluateExpression(currentInput);
      setHistory((prev) => {
        const nextEntry = {
          expression: currentInput,
          result: calculated,
        };

        return [nextEntry, ...prev].slice(0, HISTORY_LIMIT);
      });
      setPreviousValue(currentInput);
      setSelectedOperator("");
      setCurrentInput(calculated);
      setResult(calculated);
    } catch (error) {
      const message =
        error.message === "Cannot divide by zero"
          ? "Cannot divide by zero"
          : "Expressao invalida";

      setPreviousValue(currentInput);
      setSelectedOperator("");
      setResult(message);
    }
  };

  const handleButtonPress = (label) => {
    if (/^\d$/.test(label)) {
      appendDigit(label);
      return;
    }

    if (label === ".") {
      appendDecimal();
      return;
    }

    if (label === "C") {
      clearAll();
      return;
    }

    if (label === "=") {
      handleEquals();
      return;
    }

    appendOperator(label);
  };

  return (
    <LinearGradient
      colors={["#020617", "#0f172a", "#082f49"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.screen}>
          <View style={styles.orbPrimary} />
          <View style={styles.orbSecondary} />
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={["rgba(15, 23, 42, 0.94)", "rgba(3, 7, 18, 0.92)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, isCompact && styles.cardCompact]}
            >
              <Text style={styles.title}>SimpleCalculator</Text>
              <Text style={styles.subtitle}>Practical React Native learning project</Text>

              <LinearGradient
                colors={["rgba(8, 47, 73, 0.95)", "rgba(15, 23, 42, 0.96)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.display}
              >
                <Text
                  style={styles.expressionText}
                  numberOfLines={3}
                  adjustsFontSizeToFit
                >
                  {previousValue && result && result !== currentInput
                    ? previousValue
                    : displayExpression}
                </Text>
                <Text
                  style={[styles.resultText, isCompact && styles.resultTextCompact]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  {result || displayExpression}
                </Text>
                {selectedOperator ? (
                  <Text style={styles.helperText}>Current operator: {selectedOperator}</Text>
                ) : (
                  <Text style={styles.helperText}>Supports (), [] and {"{}"}</Text>
                )}
              </LinearGradient>

              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Historico</Text>
                  <Text style={styles.historyCaption}>Ultimas {HISTORY_LIMIT} contas</Text>
                </View>

                {history.length > 0 ? (
                  <ScrollView
                    horizontal
                    style={styles.historyList}
                    contentContainerStyle={styles.historyListContent}
                    showsHorizontalScrollIndicator={false}
                  >
                    {history.map((entry, index) => (
                      <Pressable
                        key={`${entry.expression}-${entry.result}-${index}`}
                        onPress={() => {
                          setCurrentInput(entry.result);
                          setPreviousValue(entry.expression);
                          setSelectedOperator("");
                          setResult(entry.result);
                        }}
                        style={({ pressed }) => [
                          styles.historyItem,
                          pressed && styles.historyItemPressed,
                        ]}
                      >
                        <Text style={styles.historyExpression} numberOfLines={1}>
                          {entry.expression}
                        </Text>
                        <Text style={styles.historyResult} numberOfLines={1}>
                          = {entry.result}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.historyEmpty}>
                    Suas contas recentes vao aparecer aqui.
                  </Text>
                )}
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
                    {row.length < 4
                      ? Array.from({ length: 4 - row.length }).map((_, index) => (
                          <View
                            key={`placeholder-${rowIndex}-${index}`}
                            style={styles.placeholder}
                          />
                        ))
                      : null}
                  </View>
                ))}
              </View>
            </LinearGradient>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingVertical: 28,
    backgroundColor: "transparent",
  },
  orbPrimary: {
    position: "absolute",
    top: 90,
    right: 10,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(34, 211, 238, 0.14)",
  },
  orbSecondary: {
    position: "absolute",
    bottom: 120,
    left: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(14, 165, 233, 0.1)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.18)",
    shadowColor: "#020617",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  cardCompact: {
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#7dd3fc",
    textAlign: "center",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  display: {
    minHeight: 160,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.16)",
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: "space-between",
    marginBottom: 18,
  },
  expressionText: {
    fontSize: 20,
    color: "#7dd3fc",
    textAlign: "right",
  },
  resultText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ecfeff",
    textAlign: "right",
  },
  resultTextCompact: {
    fontSize: 32,
  },
  helperText: {
    color: "#a5f3fc",
    textAlign: "right",
    fontSize: 13,
    marginTop: 8,
  },
  historyCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.12)",
    backgroundColor: "rgba(8, 47, 73, 0.24)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  historyTitle: {
    color: "#ecfeff",
    fontSize: 15,
    fontWeight: "700",
  },
  historyCaption: {
    color: "#67e8f9",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  historyList: {
    marginHorizontal: -2,
  },
  historyListContent: {
    paddingHorizontal: 2,
  },
  historyItem: {
    width: 150,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  historyItemPressed: {
    opacity: 0.86,
  },
  historyExpression: {
    color: "#a5f3fc",
    fontSize: 13,
  },
  historyResult: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 2,
  },
  historyEmpty: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 20,
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
