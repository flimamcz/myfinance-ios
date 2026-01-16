import React, { useState, useEffect } from "react";
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
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { createTransaction } from "../services/transaction";
import { getCategoriesByType } from "../services/categories";

export default function NewInvestmentModal({ visible, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    value: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const investmentCategories = getCategoriesByType(3); // typeId: 3 para investimentos

  // Mapeamento entre sugestões e categorias
  const suggestionToCategoryMap = {
    "Tesouro Direto": "Tesouro Direto",
    "CDB": "CDB", 
    "LCI/LCA": "CDB",
    "Ações": "Ações",
    "FIIs": "FIIs",
    "ETF": "ETF",
    "Bitcoin": "Criptomoedas",
    "Criptomoedas": "Criptomoedas",
    "Previdência": "Previdência",
    "Poupança": "Outros",
    "Fundos": "Outros",
    "Renda Fixa": "CDB",
    "Renda Variável": "Ações"
  };

  const investmentSuggestions = [
    "Tesouro Direto", "CDB", "LCI/LCA", "Ações", 
    "FIIs", "ETF", "Bitcoin", "Criptomoedas",
    "Previdência", "Poupança", "Fundos"
  ];

  const investmentTypes = [
    { id: "renda_fixa", label: "Renda Fixa", icon: "📊", color: "#3b82f6" },
    { id: "renda_variavel", label: "Renda Variável", icon: "📈", color: "#8b5cf6" },
    { id: "cripto", label: "Criptomoedas", icon: "₿", color: "#f59e0b" },
    { id: "fundo", label: "Fundos", icon: "🏦", color: "#10b981" },
  ];

  useEffect(() => {
    if (investmentCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(investmentCategories[0]);
    }
  }, [investmentCategories]);

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

  // ✅ Quando selecionar sugestão, também seleciona categoria
  const handleSuggestionSelect = (suggestion) => {
    // Atualiza a descrição
    handleInputChange("description", suggestion);
    
    // Encontra a categoria correspondente
    const categoryName = suggestionToCategoryMap[suggestion];
    if (categoryName) {
      const matchingCategory = investmentCategories.find(
        cat => cat.name === categoryName
      );
      if (matchingCategory) {
        setSelectedCategory(matchingCategory);
      }
    }
  };

  // ✅ Quando mudar categoria, atualiza sugestão se houver correspondência
  useEffect(() => {
    if (selectedCategory && formData.description) {
      // Verifica se a descrição atual corresponde a alguma sugestão
      const suggestionMatch = investmentSuggestions.find(
        suggestion => suggestionToCategoryMap[suggestion] === selectedCategory.name
      );
      
      // Se encontrar correspondência, atualiza a descrição
      if (suggestionMatch && formData.description !== suggestionMatch) {
        handleInputChange("description", suggestionMatch);
      }
    }
  }, [selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);
  };

  const isFormValid = () => {
    const hasValue = formData.value && parseFloat(getNumericValue()) > 0;
    const hasDescription = formData.description.trim().length > 0;
    const hasCategory = selectedCategory !== null;
    
    return hasValue && hasDescription && hasCategory;
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

    if (!selectedCategory) {
      Alert.alert("Erro", "Selecione uma categoria para o investimento");
      return;
    }

    try {
      setLoading(true);

      const transactionData = {
        value: getNumericValue(),
        typeId: 3, // Investimento
        description: formData.description.trim(),
        date: formData.date,
        status: true,
        categoryId: selectedCategory ? selectedCategory.id : null,
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
      notes: "",
    });
    if (investmentCategories.length > 0) {
      setSelectedCategory(investmentCategories[0]);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const CategoryPickerModal = () => (
    <Modal
      visible={showCategoryPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCategoryPicker(false)}
    >
      <View style={styles.categoryPickerOverlay}>
        <View style={styles.categoryPickerContainer}>
          <View style={styles.categoryPickerHeader}>
            <Text style={styles.categoryPickerTitle}>Selecionar Categoria</Text>
            <TouchableOpacity 
              onPress={() => setShowCategoryPicker(false)}
              style={styles.categoryPickerCloseButton}
            >
              <MaterialIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={investmentCategories}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.categoryPickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryPickerItem,
                  selectedCategory?.id === item.id && styles.categoryPickerItemSelected
                ]}
                onPress={() => handleCategorySelect(item)}
              >
                <View style={[
                  styles.categoryIcon,
                  { backgroundColor: item.color + "20" }
                ]}>
                  <Text style={styles.categoryEmoji}>{item.emoji || item.icon}</Text>
                </View>
                <Text 
                  style={[
                    styles.categoryPickerItemText,
                    selectedCategory?.id === item.id && styles.categoryPickerItemTextSelected
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const calculateReturn = (years, rate = 0.08) => {
    if (!formData.value) return "0,00";
    
    const value = parseFloat(getNumericValue());
    const futureValue = value * Math.pow(1 + rate, years);
    
    return futureValue.toFixed(2).replace(".", ",");
  };

  const getRiskLevel = (investmentType) => {
    switch(investmentType) {
      case "renda_fixa": return { level: "Baixo", color: "#22c55e" };
      case "cripto": return { level: "Alto", color: "#ef4444" };
      case "renda_variavel": return { level: "Médio-Alto", color: "#f59e0b" };
      case "fundo": return { level: "Médio", color: "#3b82f6" };
      default: return { level: "Médio", color: colors.textSecondary };
    }
  };

  const currentRisk = getRiskLevel("renda_fixa"); // Você pode ajustar isso

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
                  <Text style={styles.inputLabel}>Sugestões de ativos</Text>
                  <View style={styles.suggestionsContainer}>
                    {investmentSuggestions.map((suggestion, index) => {
                      // Verifica se esta sugestão corresponde à categoria selecionada
                      const isActive = selectedCategory && 
                        suggestionToCategoryMap[suggestion] === selectedCategory.name &&
                        formData.description === suggestion;
                      
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.suggestionChip,
                            isActive && styles.suggestionChipActive
                          ]}
                          onPress={() => handleSuggestionSelect(suggestion)}
                        >
                          <Text style={[
                            styles.suggestionText,
                            isActive && styles.suggestionTextActive
                          ]}>
                            {suggestion}
                          </Text>
                          {isActive && (
                            <MaterialIcons name="check" size={14} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ativo específico *</Text>
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
                  <Text style={styles.inputLabel}>Categoria *</Text>
                  <TouchableOpacity 
                    style={styles.categoryButton}
                    onPress={() => setShowCategoryPicker(true)}
                    disabled={loading}
                  >
                    <View style={styles.categoryButtonContent}>
                      {selectedCategory ? (
                        <View style={styles.selectedCategoryInfo}>
                          <View style={[
                            styles.categoryIconSmall,
                            { backgroundColor: selectedCategory.color + "20" }
                          ]}>
                            <Text style={styles.categoryEmojiSmall}>
                              {selectedCategory.emoji || selectedCategory.icon}
                            </Text>
                          </View>
                          <Text style={styles.selectedCategoryName}>
                            {selectedCategory.name}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.categoryPlaceholder}>
                          Selecione uma categoria
                        </Text>
                      )}
                      <MaterialIcons name="arrow-forward-ios" size={16} color={colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                  {!selectedCategory && (
                    <View style={styles.warningContainer}>
                      <MaterialIcons name="warning" size={14} color="#f59e0b" />
                      <Text style={styles.warningText}>
                        Selecione uma categoria para habilitar o registro
                      </Text>
                    </View>
                  )}
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
                  <Text style={styles.dateHint}>
                    Data atual selecionada automaticamente
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notas (Opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Ex: Vencimento em 2 anos, Taxa de administração..."
                    placeholderTextColor={colors.textSecondary + "80"}
                    value={formData.notes}
                    onChangeText={(text) => handleInputChange("notes", text)}
                    multiline
                    numberOfLines={3}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tipo de Investimento</Text>
                  <View style={styles.investmentTypesGrid}>
                    {investmentTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.investmentTypeCard,
                          { borderColor: type.color }
                        ]}
                        onPress={() => {
                          // Lógica para mapear tipo para categoria se necessário
                        }}
                      >
                        <Text style={{ fontSize: 24, marginBottom: 8 }}>{type.icon}</Text>
                        <Text style={[
                          styles.investmentTypeLabel,
                          { color: type.color, fontWeight: '600' }
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.riskContainer}>
                  <Text style={styles.inputLabel}>Perfil de risco estimado</Text>
                  <View style={styles.riskLevel}>
                    <View style={styles.riskIndicator}>
                      {["#22c55e", "#f59e0b", "#ef4444", "#94a3b8", "#94a3b8"].map((color, index) => (
                        <View 
                          key={index}
                          style={[
                            styles.riskDot,
                            { backgroundColor: color }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.riskText, { color: currentRisk.color }]}>
                      {currentRisk.level}
                    </Text>
                  </View>
                </View>
              </View>

              {/* PREVISÃO DE RETORNO */}
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
                    R$ {calculateReturn(1)}
                  </Text>
                </View>
                
                <View style={styles.returnRow}>
                  <Text style={styles.returnLabel}>Em 5 anos (8% a.a):</Text>
                  <Text style={[styles.returnValue, { color: colors.success }]}>
                    R$ {calculateReturn(5)}
                  </Text>
                </View>
                
                <View style={styles.returnRow}>
                  <Text style={styles.returnLabel}>Em 10 anos (8% a.a):</Text>
                  <Text style={[styles.returnValue, { color: colors.success }]}>
                    R$ {calculateReturn(10)}
                  </Text>
                </View>
                
                <View style={styles.returnNote}>
                  <MaterialIcons name="info" size={14} color={colors.textSecondary} />
                  <Text style={styles.returnNoteText}>
                    * Estimativa baseada em retorno médio histórico. Valores podem variar.
                  </Text>
                </View>
              </View>

              <View style={styles.tipContainer}>
                <MaterialIcons name="lightbulb" size={20} color="#f59e0b" />
                <Text style={styles.tipText}>
                  💡 Invista regularmente (DCA) e mantenha um horizonte de longo prazo para melhores resultados.
                </Text>
              </View>

              {!isFormValid() && (
                <View style={styles.formValidationContainer}>
                  <MaterialIcons name="info" size={16} color={colors.textSecondary} />
                  <Text style={styles.formValidationText}>
                    Preencha todos os campos obrigatórios (*) para registrar o investimento
                  </Text>
                </View>
              )}
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
                  !isFormValid() && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={loading || !isFormValid()}
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
      
      <CategoryPickerModal />
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
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.border,
    borderRadius: 20,
  },
  suggestionChipActive: {
    backgroundColor: colors.primary + "20",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  suggestionTextActive: {
    color: colors.primary,
    fontWeight: "600",
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  categoryButton: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCategoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryEmojiSmall: {
    fontSize: 18,
  },
  selectedCategoryName: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: "#92400e",
    flex: 1,
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
  dateHint: {
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
  },
  investmentTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  riskContainer: {
    marginTop: 10,
  },
  riskLevel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  riskText: {
    fontSize: 16,
    fontWeight: "600",
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
    marginBottom: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  formValidationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  formValidationText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
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
  // Category Picker Styles
  categoryPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  categoryPickerContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "70%",
    paddingTop: 20,
  },
  categoryPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryPickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  categoryPickerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.border,
  },
  categoryPickerList: {
    padding: 24,
  },
  categoryPickerItem: {
    flex: 1,
    alignItems: "center",
    margin: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 100,
  },
  categoryPickerItemSelected: {
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryPickerItemText: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: "center",
    fontWeight: "500",
  },
  categoryPickerItemTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
});