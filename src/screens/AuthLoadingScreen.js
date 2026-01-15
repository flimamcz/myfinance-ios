// screens/AuthLoadingScreen.js - CORRIGIDO
import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { verifySession } from "../services/auth";

export default function AuthLoadingScreen({ navigation }) {
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log("🔄 Verificando sessão salva...");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const session = await verifySession();
      
      console.log("🎯 Resultado da verificação:", {
        valida: session.isValid,
        usuario: session.user?.email
      });
      
      if (session.isValid && session.user) {
        console.log("✅ Sessão válida, indo para Home...");
        navigation.replace("Home");
      } else {
        console.log("❌ Sessão inválida ou expirada, indo para Login...");
        navigation.replace("Login");
      }
    } catch (error) {
      console.error("Erro ao verificar sessão:", error);
      navigation.replace("Login");
    }
  };

  return (
    <LinearGradient
      colors={["#f0f9ff", "#f8fafc"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary} />
        <View style={styles.textContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>💰</Text>
          </View>
          <Text style={styles.title}>Minhas Finanças</Text>
          <Text style={styles.subtitle}>Carregando sua conta...</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});