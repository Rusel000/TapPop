import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { supabase } from "./supabase";

export default function LoginScreen({ onLogin }: any) {
  const [ign, setIgn] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!ign || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email: ign, // still required by Supabase
          password,
        });

        if (error) {
          alert(error.message);
          return;
        }

        alert("Check your email to confirm account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: ign, // still required by Supabase
          password,
        });

        if (error) {
          alert(error.message);
          return;
        }

        // optional callback when login succeeds
        if (onLogin) onLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VOID TAP</Text>

      <TextInput
        placeholder="IGN (Username)"
        placeholderTextColor="#888"
        style={styles.input}
        onChangeText={setIgn}
        value={ign}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? "LOADING..."
            : isRegister
            ? "REGISTER"
            : "LOGIN"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.switchText}>
          {isRegister
            ? "Already have an account? Login"
            : "No account? Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#00f0ff",
    textAlign: "center",
    marginBottom: 40,
  },

  input: {
    backgroundColor: "#0f172a",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    color: "#fff",
  },

  button: {
    backgroundColor: "#00f0ff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    textAlign: "center",
    fontWeight: "900",
    color: "#000",
  },

  switchText: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});