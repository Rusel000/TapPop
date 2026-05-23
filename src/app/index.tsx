import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  /* =========================
     NAVIGATION
  ========================= */
  const [screen, setScreen] = useState("home");

  /* =========================
     GAME STATE
  ========================= */
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);

  const [isBadCircle, setIsBadCircle] = useState(false);
  const [showBadCircle, setShowBadCircle] = useState(false);

  const [showJumpScare, setShowJumpScare] = useState(false);
  const [badTapCount, setBadTapCount] = useState(0);

  const [circlePosition, setCirclePosition] = useState({
    x: 100,
    y: 200,
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* =========================
     ANIMATION
  ========================= */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* =========================
     TIMER
  ========================= */
  useEffect(() => {
    let timer: any;

    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  /* =========================
     MOVE CIRCLE
  ========================= */
  const moveCircle = () => {
    const size = 90;

    const randomX = Math.random() * (width - size - 40);
    const randomY = Math.random() * (height - 350);

    setCirclePosition({ x: randomX, y: randomY });

    const bad = Math.random() < 0.3;
    setIsBadCircle(bad);
    setShowBadCircle(bad);
  };

  /* =========================
     TAP
  ========================= */
  const handleTap = () => {
    if (isBadCircle) {
      setScore((p) => Math.max(p - 1, 0));

      setBadTapCount((p) => {
        const next = p + 1;

        if (next >= 3) {
          setShowJumpScare(true);
          setTimeout(() => setShowJumpScare(false), 1200);
          return 0;
        }

        return next;
      });

      moveCircle();
      return;
    }

    setScore((p) => p + 1);
    moveCircle();
  };

  /* =========================
     GAME INIT (FIXED)
  ========================= */
  const initGame = () => {
    setScore(0);
    setTimeLeft(30);
    setBadTapCount(0);
    setGameStarted(true);
    moveCircle();
  };

  const startGame = () => {
    initGame();
    setScreen("game");
  };

  const quickPlay = () => {
    initGame();
    setScreen("game");
  };

  const goHome = () => {
    setGameStarted(false);
    setScreen("home");
  };

  /* =========================
     HOME SCREEN
  ========================= */
  if (screen === "home") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.imageCircle}>
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXWGrK2iGOudNC5T56IpLZxstjchYgtKv4Jw&s",
            }}
            style={styles.circleImage}
          />
        </View>

        <Text style={styles.logo}>VOID TAP</Text>
        <Text style={styles.subtitle}>Tap. Survive. Don’t trust the red.</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={startGame}>
          <Text style={styles.primaryBtnText}>START GAME</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={quickPlay}>
          <Text style={styles.secondaryBtnText}>QUICK PLAY</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* =========================
     GAME OVER
  ========================= */
  if (gameStarted && timeLeft <= 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.gameOver}>SYSTEM FAILURE</Text>

        <Text style={styles.finalText}>SCORE</Text>
        <Text style={styles.score}>{score}</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={startGame}>
          <Text style={styles.primaryBtnText}>RESTART</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goHome}>
          <Text style={{ color: "#888", marginTop: 20 }}>BACK HOME</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* =========================
     GAME SCREEN (FIXED HUD)
  ========================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {showJumpScare && (
        <Image
          source={{
            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvli4utRIF6YKZQLf7LVob7FqjRaphVmE5Mw&s",
          }}
          style={styles.jumpscare}
        />
      )}

      {/* ================= HUD TOP BAR (FIXED) ================= */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goHome}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>

        <Text style={styles.hudText}>Score: {score}</Text>
        <Text style={styles.hudText}>Time: {timeLeft}</Text>
      </View>

      {/* GAME CIRCLE */}
      <Animated.View
        style={[
          styles.circle,
          {
            left: circlePosition.x,
            top: circlePosition.y,
            transform: [{ scale: scaleAnim }],
            backgroundColor: showBadCircle ? "#ff003c" : "#00f0ff",
          },
        ]}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={handleTap} />
      </Animated.View>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05060a",
    alignItems: "center",
    justifyContent: "center",
  },

  /* HOME */
  imageCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#00f0ff",
  },

  circleImage: {
    width: "100%",
    height: "100%",
  },

  logo: {
    fontSize: 55,
    fontWeight: "900",
    color: "#00f0ff",
    letterSpacing: 4,
  },

  subtitle: {
    color: "#888",
    marginTop: 10,
    marginBottom: 40,
  },

  primaryBtn: {
    backgroundColor: "#00f0ff",
    padding: 15,
    borderRadius: 12,
    width: 200,
    marginTop: 10,
  },

  primaryBtnText: {
    textAlign: "center",
    fontWeight: "900",
    color: "#000",
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#00f0ff",
    padding: 15,
    borderRadius: 12,
    width: 200,
    marginTop: 10,
  },

  secondaryBtnText: {
    textAlign: "center",
    color: "#00f0ff",
  },

  /* ================= HUD (FIXED) ================= */
  topBar: {
    position: "absolute",
    top: 50,
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backText: {
    color: "#00f0ff",
    fontWeight: "900",
    fontSize: 16,
  },

  hudText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  /* GAME */
  circle: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 50,
  },

  jumpscare: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 999,
  },

  /* GAME OVER */
  gameOver: {
    color: "#ff2d55",
    fontSize: 40,
    fontWeight: "900",
  },

  finalText: {
    color: "#888",
    marginTop: 20,
  },

  score: {
    fontSize: 80,
    fontWeight: "900",
    color: "#fff",
  },
});