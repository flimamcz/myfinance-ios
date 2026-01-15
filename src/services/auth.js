// services/auth.js - VERSÃO COMPLETA
import api from "./api";
import { saveSession, getSession } from "./session";

export async function loginRequest(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const data = response.data;

  if (data.error) {
    throw new Error(data.message || "Erro no login");
  }

  // centraliza regra de sessão AQUI
  await saveSession(data.user, data.token);

  return data.user;
}

// ✅ NOVA FUNÇÃO: Verificar se sessão ainda é válida
export async function verifySession() {
  try {
    const session = await getSession();
    
    console.log("🔍 Verificando sessão:", {
      temUsuario: !!session?.user,
      temToken: !!session?.token,
      usuario: session?.user?.email
    });
    
    if (!session || !session.token || !session.user) {
      console.log("❌ Sessão inválida: token ou usuário faltando");
      return { isValid: false, user: null };
    }

    // Tenta uma requisição autenticada para validar o token
    const response = await api.get("/auth/verify", {
      headers: {
        'Authorization': `Bearer ${session.token}`
      }
    });

    console.log("✅ Token válido na API");
    return { 
      isValid: true, 
      user: session.user,
      token: session.token
    };
    
  } catch (error) {
    console.log("❌ Erro na verificação da sessão:", {
      status: error.response?.status,
      message: error.message
    });
    
    // Se erro 401 (Unauthorized), token expirou/inválido
    if (error.response?.status === 401) {
      console.log("⚠️ Token expirado ou inválido");
    }
    
    return { isValid: false, user: null };
  }
}

// ✅ NOVA FUNÇÃO: Fazer logout (opcional, mas útil)
export async function logoutRequest() {
  try {
    const session = await getSession();
    
    if (session?.token) {
      // Se sua API tem endpoint de logout, chame aqui
      // await api.post('/auth/logout', {}, {
      //   headers: {
      //     'Authorization': `Bearer ${session.token}`
      //   }
      // });
    }
  } catch (error) {
    console.log("Erro no logout (pode ignorar):", error);
  } finally {
    // Sempre limpa a sessão local
    const { clearSession } = await import("./session");
    await clearSession();
  }
}