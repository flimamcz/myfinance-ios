import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { createTransaction } from "../services/transaction";

export default function NewInvestmentModal({ visible, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    value: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    investmentType: "renda_fixa", 
  });

  const investmentTypes = [
    { id: "renda_fixa", label: "Renda Fixa", icon: "📊", color: "#3b82f6" },
    { id: "renda_variavel", label: "Renda Variável", icon: "📈", color: "#8b5cf6" },
    { id: "cripto", label: "Criptomoedas", icon: "₿", color: "#f59e0b" },
    { id: "fundo", label: "Fundos", icon: "🏦", color: "#10b981" },
  ];

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const formatCurrencyInput = (text) => {
    let numericValue = text.replace(/[^0-9]/g, "");
    
    if (numericValue) {
      const value = (parseInt(numericValue) / 100).toFixed(2);
      return value.replace(".", ",");
    }
    
    return "";
  };

  const handleValueChange = (text) => {
    const formatted = formatCurrencyInput(text);
    handleInputChange("value", formatted);
  };

  const getNumericValue = () => {
    if (!formData.value) return "0";
    return formData.value.replace(",", ".");
  };

  const getInvestmentTypeLabel = (typeId) => {
    const type = investmentTypes.find(t => t.id === typeId);
    return type ? type.label : "Outro";
  };

  const getInvestmentTypeColor = (typeId) => {
    const type = investmentTypes.find(t => t.id === typeId);
    return type ? type.color : colors.primary;
  };

  const handleSubmit = async () => {
    if (!formData.value || parseFloat(getNumericValue()) <= 0) {
      Alert.alert("Erro", "Informe um valor válido para o investimento");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Erro", "Informe uma descrição para o investimento");
      return;
    }

    try {
      setLoading(true);

      const transactionData = {
        value: getNumericValue(),
        typeId: 3, 
        description: `${getInvestmentTypeLabel(formData.investmentType)} - ${formData.description.trim()}`,
        date: formData.date,
        status: true,
      };

      console.log("📤 Enviando novo investimento:", transactionData);

      const response = await createTransaction(transactionData);

      if (response.error) {
        Alert.alert("Erro", response.message || "Não foi possível criar o investimento");
        return;
      }

      Alert.alert(
        "Investimento realizado!",
        "Seu investimento foi registrado com sucesso! 🚀",
        [
          {
            text: "Ver detalhes",
            onPress: () => {
              resetForm();
              onSuccess(); 
            },
          },
        ]
      );

    } catch (error) {
      console.error("Erro ao criar investimento:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Erro ao registrar investimento. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      value: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      investmentType: "renda_fixa",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const investmentSuggestions = [
    "Tesouro Direto", "CDB", "LCI/LCA", "Ações", 
    "FIIs", "ETF", "Bitcoin", "Poupança"
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.7)"]}
          style={styles.modalBackground}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleContainer}>
                <View style={[styles.iconContainer, { backgroundColor: "#6366f120" }]}>
                  <FontAwesome5 name="chart-line" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Novo Investimento</Text>
                  <Text style={styles.modalSubtitle}>Invista no seu futuro</Text>
                </View>
              </View>
              
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Valor do Investimento (R$)</Text>
                  <View style={styles.valueInputContainer}>
                    <Text style={styles.currencySymbol}>R$</Text>
                    <TextInput
                      style={styles.valueInput}
                      placeholder="0,00"
                      placeholderTextColor={colors.textSecondary + "80"}
                      keyboardType="numeric"
                      value={formData.value}
                      onChangeText={handleValueChange}
                      editable={!loading}
                    />
                  </View>
                  <Text style={styles.valueHint}>
                    Recomendado: 10-20% da sua renda mensal
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tipo de Investimento</Text>
                  <View style={styles.investmentTypesGrid}>
                    {investmentTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.investmentTypeCard,
                          formData.investmentType === type.id && styles.investmentTypeCardSelected,
                          { borderColor: formData.investmentType === type.id ? type.color : colors.border }
                        ]}
                        onPress={() => handleInputChange("investmentType", type.id)}
                      >
                        <Text style={{ fontSize: 24, marginBottom: 8 }}>{type.icon}</Text>
                        <Text style={[
                          styles.investmentTypeLabel,
                          formData.investmentType === type.id && { color: type.color, fontWeight: '700' }
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sugestões de ativos</Text>
                  <View style={styles.suggestionsContainer}>
                    {investmentSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionChip}
                        onPress={() => handleInputChange("description", suggestion)}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ativo específico</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: CDB Banco XYZ 110% CDI, Ações PETR4..."
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={formData.description}
                    onChangeText={(text) => handleInputChange("description", text)}
                    editable={!loading}
                    multiline
                    maxLength={100}
                  />
                  <Text style={styles.charCount}>
                    {formData.description.length}/100
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Data da aplicação</Text>
                  <View style={styles.dateContainer}>
                    <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                    <Text style={styles.dateText}>
                      {new Date(formData.date).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Objetivo (Opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Ex: Reserva de emergência, Aposentadoria..."
                    placeholderTextColor={colors.textSecondary + "80"}
                    multiline
                    numberOfLines={2}
                    editable={!loading}
                  />
                </View>

                {/* PERFIL DE RISCO (Placeholder) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Perfil de risco</Text>
                  <TouchableOpacity 
                    style={styles.riskButton}
                    disabled={true}
                  >
                    <View style={styles.riskIndicator}>
                      <View style={[styles.riskDot, { backgroundColor: '#22c55e' }]} />
                      <View style={[styles.riskDot, { backgroundColor: '#f59e0b' }]} />
                      <View style={[styles.riskDot, { backgroundColor: colors.border }]} />
                      <View style={[styles.riskDot, { backgroundColor: colors.border }]} />
                      <View style={[styles.riskDot, { backgroundColor: colors.border }]} />
                    </View>
                    <Text style={styles.riskButtonText}>Moderado</Text>
                    <MaterialIcons name="arrow-forward-ios" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* PREVISÃO DE RETORNO (Estimativa) */}
              <View style={styles.returnEstimate}>
                <Text style={styles.returnTitle}>📊 Estimativa de Retorno</Text>
                
                <View style={styles.returnRow}>
                  <Text style={styles.returnLabel}>Valor investido:</Text>
                  <Text style={styles.returnValue}>
                    {formData.value ? `R$ ${formData.value}` : "R$ 0,00"}
                  </Text>
                </View>
                
                <View style={styles.returnRow}>
                  <Text style={styles.returnLabel}>Em 1 ano (8% a.a):</Text>
                  <Text style={[styles.returnValue, { color: colors.success }]}>
                    {formData.value ? 
                      `R$ ${(parseFloat(getNumericValue()) * 1.08).toFixed(2).replace('.', ',')}` : 
                      "R$ 0,00"}
                  </Text>
                </View>
                
                <View style={styles.returnRow}>
                  <Text style={styles.returnLabel}>Em 5 anos (8% a.a):</Text>
                  <Text style={[styles.returnValue, { color: colors.success }]}>
                    {formData.value ? 
                      `R$ ${(parseFloat(getNumericValue()) * Math.pow(1.08, 5)).toFixed(2).replace('.', ',')}` : 
                      "R$ 0,00"}
                  </Text>
                </View>
                
                <View style={styles.returnNote}>
                  <MaterialIcons name="info" size={14} color={colors.textSecondary} />
                  <Text style={styles.returnNoteText}>
                    * Estimativa baseada em retorno médio histórico
                  </Text>
                </View>
              </View>

              <View style={styles.tipContainer}>
                <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
                <Text style={styles.tipText}>
                  Invista regularmente (DCA) e mantenha um horizonte de longo prazo para melhores resultados.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!formData.value || !formData.description) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={loading || !formData.value || !formData.description}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <FontAwesome5 name="chart-line" size={16} color="#fff" />
                    <Text style={styles.submitButtonText}>Investir Agora</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    marginTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.border,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  valueInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary + "40",
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    paddingVertical: 12,
  },
  valueHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: "italic",
  },
  investmentTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  investmentTypeCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  investmentTypeCardSelected: {
    backgroundColor: "#eff6ff",
  },
  investmentTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.border,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  riskButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  riskIndicator: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  returnEstimate: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  returnTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  returnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "40",
  },
  returnLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  returnValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 2,
    textAlign: "right",
  },
  returnNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  returnNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3b82f630",
    marginBottom: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 18,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: colors.primary + "80",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});