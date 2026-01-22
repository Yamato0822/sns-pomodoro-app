import { View, Text, Pressable, Animated, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePomodoro } from "@/lib/pomodoro-context";
import { useFocusLogs } from "@/lib/focus-log-context";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { SNSPostModal } from "@/components/sns-post-modal";
import { useSNSPosts } from "@/lib/sns-post-context";

export default function PomodoroScreen() {
  const colors = useColors();
  const router = useRouter();
  const { session, startFocus, pause, resume, stop, isRunning, progress, remainingTime } =
    usePomodoro();
  const { addLog } = useFocusLogs();
  const { addPost } = useSNSPosts();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showSNSPostModal, setShowSNSPostModal] = useState(false);
  const [focusCompleted, setFocusCompleted] = useState(false);

  // Animate pulse effect when timer is running
  useEffect(() => {
    if (!isRunning) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [isRunning, pulseAnim]);

  // Trigger haptic when session completes
  useEffect(() => {
    if (session.state !== "IDLE" && remainingTime === 0 && session.elapsedTime > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Check if Focus session just completed
      if (session.state === "FOCUS" && !focusCompleted) {
        setFocusCompleted(true);
        // Show SNS post modal after a short delay
        setTimeout(() => {
          setShowSNSPostModal(true);
        }, 500);
      }
    }
  }, [remainingTime, session.state, session.elapsedTime, focusCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartFocus = () => {
    startFocus();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePause = () => {
    pause();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleResume = () => {
    resume();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStop = () => {
    stop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleClose = () => {
    stop();
    router.back();
  };

  const handleCloseSNSPostModal = () => {
    setShowSNSPostModal(false);
    // Close the pomodoro screen after posting
    setTimeout(() => {
      router.back();
    }, 300);
  };

  const isIdle = session.state === "IDLE";
  const isFocus = session.state === "FOCUS";
  const isBreak = session.state === "BREAK";
  const isPaused = session.state === "PAUSED";

  const getStatusLabel = () => {
    if (isFocus) return "集中中";
    if (isBreak) return "休憩中";
    if (isPaused) return "一時停止";
    return "ポモドーロ";
  };

  const getStatusColor = () => {
    if (isFocus) return colors.error;
    if (isBreak) return colors.success;
    if (isPaused) return colors.warning;
    return colors.muted;
  };

  const getBgColor = () => {
    if (isFocus) return "bg-rose-950";
    if (isBreak) return "bg-emerald-950";
    if (isPaused) return "bg-amber-950";
    return "bg-slate-950";
  }

  return (
    <>
      <ScreenContainer
        className={`flex-1 ${getBgColor()} p-0`}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          scrollEnabled={false}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 pt-6 pb-10">
            <View>
              <Text
                className="text-4xl font-extrabold tracking-tighter"
                style={{ color: getStatusColor() }}
              >
                {getStatusLabel()}
              </Text>
              <Text className="text-sm text-white/50 mt-1 font-medium">
                {isFocus ? "集中力を高めよう" : isBreak ? "リフレッシュしよう" : "スタートを押して始めましょう"}
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              className="w-11 h-11 rounded-2xl bg-white/10 items-center justify-center active:bg-white/20"
            >
              <IconSymbol name="xmark" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Main Timer Circle */}
          <View className="items-center justify-center my-12">
            {/* Outer Glow */}
            <View
              className="absolute w-80 h-80 rounded-full opacity-10"
              style={{ backgroundColor: getStatusColor() }}
            />

            {/* Main Circle */}
            <View className="w-72 h-72 rounded-full bg-slate-900 items-center justify-center border-2 border-white/5 shadow-2xl">
              {/* Progress Ring (Conceptual - actual ring would need SVG/Canvas, keeping original logic) */}
              <Animated.View
                className="absolute w-64 h-64 rounded-full border-4 border-transparent"
                style={{
                  borderTopColor: getStatusColor(),
                  borderRightColor: getStatusColor(),
                  transform: [{ rotate: `${(progress / 100) * 360}deg` }],
                }}
              />

              {/* Center Content */}
              <Animated.View
                className="items-center justify-center"
                style={{ transform: [{ scale: pulseAnim }] }}
              >
                <Text
                  className="text-7xl font-bold tracking-tight"
                  style={{ color: getStatusColor() }}
                >
                  {formatTime(remainingTime)}
                </Text>
                <Text className="text-sm text-white/40 mt-3 font-semibold tracking-widest uppercase">
                  {isFocus ? "Focus" : isBreak ? "Break" : "Ready"}
                </Text>
              </Animated.View>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="px-6 mb-10">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xs font-bold text-white/40 tracking-wider uppercase">
                Progress
              </Text>
              <Text
                className="text-xs font-bold"
                style={{ color: getStatusColor() }}
              >
                {Math.round(progress)}%
              </Text>
            </View>
            <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <Animated.View
                className="h-full rounded-full"
                style={{
                  backgroundColor: getStatusColor(),
                  width: `${progress}%`,
                }}
              />
            </View>
          </View>

          {/* Stats Card */}
          <View className="mx-6 mb-10 bg-white/5 rounded-3xl p-5 border border-white/5">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-white/40 mb-1.5 font-medium">
                  SESSION TIME
                </Text>
                <Text className="text-3xl font-bold text-white">
                  {formatTime(session.totalFocusTime)}
                </Text>
              </View>
              <View className="w-16 h-16 rounded-2xl bg-white/10 items-center justify-center">
                <IconSymbol name="flame.fill" size={32} color={getStatusColor()} />
              </View>
            </View>
          </View>

          {/* Control Buttons */}
          <View className="px-6 pb-10 gap-4">
            {isIdle ? (
              <Pressable
                onPress={handleStartFocus}
                className="w-full h-16 rounded-2xl items-center justify-center flex-row gap-3 active:opacity-90"
                style={{ backgroundColor: getStatusColor() }}
              >
                <IconSymbol name="play.fill" size={22} color="#FFFFFF" />
                <Text className="text-lg font-bold text-white">
                  START FOCUS
                </Text>
              </Pressable>
            ) : (
              <View className="flex-row gap-4">
                {isPaused ? (
                  <Pressable
                    onPress={handleResume}
                    className="flex-1 h-16 rounded-2xl items-center justify-center active:opacity-90"
                    style={{ backgroundColor: getStatusColor() }}
                  >
                    <IconSymbol name="play.fill" size={24} color="#FFFFFF" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handlePause}
                    className="flex-1 h-16 rounded-2xl items-center justify-center bg-amber-500 active:opacity-90"
                  >
                    <IconSymbol name="pause.fill" size={24} color="#FFFFFF" />
                  </Pressable>
                )}

                <Pressable
                  onPress={handleStop}
                  className="flex-1 h-16 rounded-2xl items-center justify-center bg-rose-500 active:opacity-90"
                >
                  <IconSymbol name="stop.fill" size={24} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* SNS Post Modal */}
      <SNSPostModal
        visible={showSNSPostModal}
        onClose={handleCloseSNSPostModal}
        focusMinutes={Math.round(session.totalFocusTime / 60)}
      />
    </>
  );
}
