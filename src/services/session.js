import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveSession(user, token) {
  await AsyncStorage.setItem("@user", JSON.stringify(user));
  await AsyncStorage.setItem("@token", token);
}

export async function getSession() {
  const user = await AsyncStorage.getItem("@user");
  const token = await AsyncStorage.getItem("@token");

  return {
    user: user ? JSON.parse(user) : null,
    token,
  };
}

export async function clearSession() {
  await AsyncStorage.multiRemove(["@user", "@token"]);
}
