import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { loginRequest } from "../services/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

async function handleLogin() {
  if (!email || !password) {
    Alert.alert("Erro", "Informe email e senha");
    return;
  }

  try {
    setLoading(true);

    const data = await loginRequest(email, password);

    console.log("LOGIN RESPONSE:", data);

    if (data.error) {
      Alert.alert("Erro", data.message || "Login inválido");
      return;
    }

    navigation.replace("Home");
  } catch (error) {
    console.log("LOGIN ERROR:", error?.response?.data || error.message);
    Alert.alert("Falha no login", "Verifique suas credenciais");
  } finally {
    setLoading(false);
  }
}


  return (
    <LinearGradient
      colors={["#f0f9ff", "#fef2f2", "#f0fdf4", "#eff6ff"]}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Minhas Finanças</Text>
            <Text style={styles.subtitle}>Controle financeiro seguro</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔒 Seguro & Criptografado</Text>
            </View>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="Senha"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgot}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
  },
  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 14,
  },
  badge: {
    marginTop: 16,
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 50,
  },
  badgeText: {
    color: colors.success,
    fontWeight: "600",
    fontSize: 12,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 12,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  forgot: {
    marginTop: 16,
    textAlign: "center",
    color: colors.primary,
    fontWeight: "500",
  },
});
