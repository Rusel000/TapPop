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
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [screen, setScreen] = useState("home");

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);

  const [isBadCircle, setIsBadCircle] = useState(false);
  const [showJumpScare, setShowJumpScare] = useState(false);
  const [badTapCount, setBadTapCount] = useState(0);

  const [difficulty, setDifficulty] = useState(1);

  // GAME MODE
  const [gameMode, setGameMode] = useState("normal");

  // BEST SCORES
  const [bestScore, setBestScore] = useState(0);
  const [bestEndlessScore, setBestEndlessScore] =
    useState(0);

  const [circlePosition, setCirclePosition] = useState({
    x: 100,
    y: 200,
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const autoMoveRef = useRef(null);
  const difficultyRef = useRef(null);

  /* =========================
     LOAD BEST SCORES
  ========================= */
  useEffect(() => {
    loadBestScores();
  }, []);

  const loadBestScores = async () => {
    try {
      const normal = await AsyncStorage.getItem(
        "bestScore"
      );

      const endless = await AsyncStorage.getItem(
        "bestEndlessScore"
      );

      if (normal) {
        setBestScore(Number(normal));
      }

      if (endless) {
        setBestEndlessScore(Number(endless));
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================
     SAVE BEST SCORE
  ========================= */
  const saveBestScore = async () => {
    try {
      // NORMAL MODE
      if (gameMode === "normal") {
        if (score > bestScore) {
          setBestScore(score);

          await AsyncStorage.setItem(
            "bestScore",
            String(score)
          );
        }
      }

      // ENDLESS MODE
      if (gameMode === "endless") {
        if (score > bestEndlessScore) {
          setBestEndlessScore(score);

          await AsyncStorage.setItem(
            "bestEndlessScore",
            String(score)
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================
     AUTO SAVE WHEN GAME ENDS
  ========================= */
  useEffect(() => {
    if (timeLeft <= 0 && gameStarted) {
      saveBestScore();
    }
  }, [timeLeft]);

  /* =========================
     PULSE ANIMATION
  ========================= */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 400,
          useNativeDriver: true,
        }),

        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* =========================
     SCREEN SHAKE
  ========================= */
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 40,
        useNativeDriver: true,
      }),

      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 40,
        useNativeDriver: true,
      }),

      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 40,
        useNativeDriver: true,
      }),

      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* =========================
     TIMER
  ========================= */
  useEffect(() => {
    let timer;

    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          // ENDLESS MODE
          if (gameMode === "endless") {
            return Math.max(prev - 0.05, 0);
          }

          // NORMAL MODE
          return prev - 1;
        });
      }, gameMode === "endless" ? 100 : 1000);
    }

    return () => clearInterval(timer);
  }, [gameStarted, gameMode]);

  /* =========================
     DIFFICULTY SYSTEM
  ========================= */
  useEffect(() => {
    if (!gameStarted) return;

    setDifficulty(1);

    const interval = setInterval(() => {
      setDifficulty((prev) => prev + 1);
    }, gameMode === "endless" ? 6000 : 10000);

    difficultyRef.current = interval;

    return () => clearInterval(interval);
  }, [gameStarted, gameMode]);

  /* =========================
     CLEANUP
  ========================= */
  useEffect(() => {
    return () => {
      if (autoMoveRef.current) {
        clearTimeout(autoMoveRef.current);
      }

      if (difficultyRef.current) {
        clearInterval(difficultyRef.current);
      }
    };
  }, []);

  /* =========================
     MOVE CIRCLE
  ========================= */
  const moveCircle = () => {
    if (!gameStarted) return;

    const size = 90;

    const randomX = Math.random() * (width - size - 40);
    const topSafeArea = 180;
    const randomY = Math.random() * (height - 420) + topSafeArea;

    // LESS RED DOTS
    const badChance = Math.min(
      0.12 + difficulty * 0.04,
      0.45
    );

    const bad = Math.random() < badChance;

    setCirclePosition({
      x: randomX,
      y: randomY,
    });

    setIsBadCircle(bad);

    const speed = Math.max(
      1200 - difficulty * 140,
      300
    );

    if (autoMoveRef.current) {
      clearTimeout(autoMoveRef.current);
    }

    autoMoveRef.current = setTimeout(() => {
      moveCircle();
    }, Math.random() * speed + 300);
  };

  /* =========================
     TAP LOGIC
  ========================= */
  const handleTap = () => {
    if (isBadCircle) {
      triggerShake();

      setCombo(0);

      setScore((prev) => Math.max(prev - 1, 0));

      setBadTapCount((prev) => {
        const next = prev + 1;

        if (next >= 3) {
          setShowJumpScare(true);

          setTimeout(() => {
            setShowJumpScare(false);
          }, 1200);

          return 0;
        }

        return next;
      });
    } else {
      setCombo((prev) => prev + 1);

      setScore((prev) => prev + 1 + Math.floor(combo / 5));

      // ENDLESS MODE BONUS TIME
      if (gameMode === "endless") {
        setTimeLeft((prev) =>
          Math.min(prev + 1, 999)
        );
      }
    }

    moveCircle();
  };

  /* =========================
     INIT GAME
  ========================= */
  const initGame = (mode = "normal") => {
    setGameMode(mode);

    setScore(0);

    setCombo(0);

    setBadTapCount(0);

    setDifficulty(1);

    setGameStarted(true);

    if (mode === "endless") {
      setTimeLeft(25);
    } else {
      setTimeLeft(30);
    }

    setTimeout(() => {
      moveCircle();
    }, 100);
  };

  const startGame = () => {
    initGame("normal");
    setScreen("game");
  };

  const quickPlay = () => {
    initGame("normal");
    setScreen("game");
  };

  const endlessMode = () => {
    initGame("endless");
    setScreen("game");
  };

  const goHome = () => {
    setGameStarted(false);

    if (autoMoveRef.current) {
      clearTimeout(autoMoveRef.current);
    }

    if (difficultyRef.current) {
      clearInterval(difficultyRef.current);
    }

    setScreen("home");
  };

  /* =========================
     HOME SCREEN
  ========================= */
  if (screen === "home") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.glowCircle}>
          <View style={styles.imageCircle}>
            <Image
              source={{
                uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXWGrK2iGOudNC5T56IpLZxstjchYgtKv4Jw&s",
              }}
              style={styles.circleImage}
            />
          </View>
        </View>

        <Text style={styles.logo}>VOID TAP</Text>

        <Text style={styles.subtitle}>
          Tap. Survive. Don’t trust the red.
        </Text>

        {/* BEST SCORES */}
        <View style={styles.bestContainer}>
          <Text style={styles.bestText}>
            NORMAL BEST: {bestScore}
          </Text>

          <Text style={styles.bestText}>
            ENDLESS BEST: {bestEndlessScore}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={startGame}
        >
          <Text style={styles.primaryBtnText}>
            START GAME
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={quickPlay}
        >
          <Text style={styles.secondaryBtnText}>
            QUICK PLAY
          </Text>
        </TouchableOpacity>

        {/* ENDLESS MODE */}
        <TouchableOpacity
          style={styles.endlessBtn}
          onPress={endlessMode}
        >
          <Text style={styles.endlessBtnText}>
            ENDLESS MODE
          </Text>
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
        <Text style={styles.gameOver}>
          SYSTEM FAILURE
        </Text>

        <Text style={styles.finalText}>
          FINAL SCORE
        </Text>

        <Text style={styles.score}>{score}</Text>

        <Text style={styles.bestGameOver}>
          BEST:{" "}
          {gameMode === "normal"
            ? bestScore
            : bestEndlessScore}
        </Text>

        <Text style={styles.comboText}>
          MAX LEVEL: {difficulty}
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={startGame}
        >
          <Text style={styles.primaryBtnText}>
            RESTART
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goHome}>
          <Text style={styles.backHome}>
            BACK HOME
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* =========================
     GAME SCREEN
  ========================= */
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateX: shakeAnim,
            },
          ],
        },
      ]}
    >
      <StatusBar style="light" />

      {/* JUMPSCARE */}
      {showJumpScare && (
        <Image
          source={{
            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvli4utRIF6YKZQLf7LVob7FqjRaphVmE5Mw&s",
          }}
          style={styles.jumpscare}
        />
      )}

      {/* HUD */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goHome}>
          <Text style={styles.backText}>
            ← BACK
          </Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.hudText}>
            Score: {score}
          </Text>

          <Text style={styles.comboHud}>
            Combo: {combo}
          </Text>
        </View>

        <View>
          <Text style={styles.hudText}>
            Time: {timeLeft.toFixed(1)}
          </Text>

          <Text style={styles.levelText}>
            Level: {difficulty}
          </Text>

          <Text style={styles.modeText}>
            {gameMode.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* CIRCLE */}
      <Animated.View
        style={[
          styles.circle,
          {
            left: circlePosition.x,
            top: circlePosition.y,

            transform: [{ scale: scaleAnim }],

            backgroundColor: isBadCircle
              ? `rgba(255,0,60,${
                  0.5 + difficulty * 0.05
                })`
              : "#00f0ff",

            shadowColor: isBadCircle
              ? "#ff003c"
              : "#00f0ff",
          },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={handleTap}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02030a",
    alignItems: "center",
    justifyContent: "center",

    borderTopWidth: 1,
    borderTopColor: "rgba(0,240,255,0.08)",
  },

  glowCircle: {
    shadowColor: "#00f0ff",
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 30,
  },

  imageCircle: {
    width: 170,
    height: 170,
    borderRadius: 100,
    overflow: "hidden",

    borderWidth: 3,
    borderColor: "#00f0ff",

    marginBottom: 25,
  },

  circleImage: {
    width: "100%",
    height: "100%",
  },

  logo: {
    fontSize: 58,
    fontWeight: "900",
    color: "#00f0ff",

    letterSpacing: 5,
  },

  subtitle: {
    color: "#7d8590",

    marginTop: 12,
    marginBottom: 25,

    fontSize: 14,
    letterSpacing: 1,
  },

  bestContainer: {
    marginBottom: 25,
    alignItems: "center",
  },

  bestText: {
    color: "#00f0ff",

    fontSize: 14,

    fontWeight: "700",

    marginTop: 4,

    letterSpacing: 1,
  },

  primaryBtn: {
    backgroundColor: "#00f0ff",

    width: 230,

    paddingVertical: 16,

    borderRadius: 16,

    marginTop: 10,

    shadowColor: "#00f0ff",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },

  primaryBtnText: {
    textAlign: "center",

    fontWeight: "900",

    color: "#000",

    letterSpacing: 2,
  },

  secondaryBtn: {
    width: 230,

    paddingVertical: 16,

    borderRadius: 16,

    borderWidth: 1.5,
    borderColor: "#00f0ff",

    marginTop: 15,
  },

  secondaryBtnText: {
    textAlign: "center",

    color: "#00f0ff",

    fontWeight: "700",

    letterSpacing: 2,
  },

  endlessBtn: {
    width: 230,

    paddingVertical: 16,

    borderRadius: 16,

    marginTop: 15,

    backgroundColor: "#ff003c",

    shadowColor: "#ff003c",
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },

  endlessBtnText: {
    textAlign: "center",

    color: "#fff",

    fontWeight: "900",

    letterSpacing: 2,
  },

  topBar: {
    position: "absolute",

    top: 55,

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

    fontSize: 15,
  },

  comboHud: {
    color: "#00f0ff",

    fontWeight: "700",

    marginTop: 4,
  },

  levelText: {
    color: "#ff2d55",

    fontWeight: "700",

    marginTop: 4,

    textAlign: "right",
  },

  modeText: {
    color: "#00f0ff",

    marginTop: 3,

    fontWeight: "700",

    textAlign: "right",
  },

  circle: {
    position: "absolute",

    width: 90,
    height: 90,

    borderRadius: 50,

    shadowOpacity: 1,
    shadowRadius: 25,

    elevation: 25,
  },

  jumpscare: {
    position: "absolute",

    width: "100%",
    height: "100%",

    zIndex: 999,
  },

  gameOver: {
    color: "#ff2d55",

    fontSize: 42,

    fontWeight: "900",

    letterSpacing: 3,
  },

  finalText: {
    color: "#777",

    marginTop: 25,

    letterSpacing: 2,
  },

  score: {
    fontSize: 90,

    fontWeight: "900",

    color: "#fff",
  },

  bestGameOver: {
    color: "#00f0ff",

    fontSize: 18,

    fontWeight: "700",

    marginBottom: 15,
  },

  comboText: {
    color: "#00f0ff",

    marginBottom: 40,

    fontWeight: "700",

    letterSpacing: 1,
  },

  backHome: {
    color: "#777",

    marginTop: 20,

    letterSpacing: 1,
  },
});