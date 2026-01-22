import { ScrollView, Text, View, Pressable, Switch, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useClerkAuthState } from "@/hooks/use-clerk-auth";
import { useColors } from "@/hooks/use-colors";
import { useSettings } from "@/lib/settings-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusLogs } from "@/lib/focus-log-context";
import { calculateWeeklyStats, formatDurationParts } from "@/lib/stats-utils";

export default function ProfileScreen() {
  const { user, isAuthenticated, loading, logout } = useClerkAuthState();
  const colors = useColors();
  const router = useRouter();
  const { settings, updateTheme, updateFontSize, updateWeekStart, updateReminderEnabled } =
    useSettings();
  const { logs } = useFocusLogs();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [weekStats, setWeekStats] = useState({
    totalFocusMinutes: 0,
    pomodoroCount: 0,
  });

  useEffect(() => {
    const stats = calculateWeeklyStats(logs, settings.weekStart);
    setWeekStats({
      totalFocusMinutes: stats.totalFocusMinutes,
      pomodoroCount: stats.pomodoroCount,
    });
  }, [logs, settings.weekStart]);

  const handleLogout = async () => {
    Alert.alert("ログアウト", "本当にログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logout();
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleClearData = async () => {
    Alert.alert("データ初期化", "すべてのタスクとログを削除します。この操作は取り消せません。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("app_tasks");
            await AsyncStorage.removeItem("pomodoro_focus_logs");
            await AsyncStorage.removeItem("pomodoro_reactions");
            Alert.alert("成功", "データが初期化されました");
          } catch (error) {
            Alert.alert("エラー", "データの初期化に失敗しました");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  // ログイン前の画面
  if (!isAuthenticated) {
    return (
      <ScreenContainer className="pb-24">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 items-center justify-center px-4 py-12">
            <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-6">
              <IconSymbol name="person.fill" size={48} color={colors.background} />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">ログインしてください</Text>
            <Text className="text-sm text-muted text-center mb-8">
              アカウントにログインして、すべての機能を利用できます
            </Text>
            <Pressable
              onPress={() => router.push("/sign-in")}
              className="w-full bg-primary rounded-lg py-4 items-center justify-center mb-3"
            >
              <Text className="text-background font-semibold text-base">ログイン</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ログイン後の画面
  return (
    <ScreenContainer className="pb-24">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Profile Section */}
        <View className="px-4 pt-4 pb-6">
          <View className="bg-surface rounded-lg p-6 items-center border border-border">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
              <IconSymbol name="person.fill" size={40} color={colors.background} />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-1">
              {user?.fullName || "ユーザー"}
            </Text>
            <Text className="text-sm text-muted mb-6">{user?.email}</Text>

            {/* Action Buttons */}
            <View className="flex-row gap-3 w-full">
              <Pressable
                onPress={() => Alert.alert("プロフィール編集", "プロフィール編集機能は準備中です")}
                className="flex-1 bg-primary/10 rounded-lg py-3 items-center justify-center"
              >
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="pencil" size={16} color={colors.primary} />
                  <Text className="text-primary font-semibold text-sm">プロフィール編集</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 bg-error/10 rounded-lg py-3 items-center justify-center"
              >
                <View className="flex-row items-center gap-2">
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <IconSymbol name="arrow.left" size={16} color={colors.error} />
                  )}
                  <Text className="text-error font-semibold text-sm">ログアウト</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Statistics Section */}


        {/* Account Section */}
        <View className="px-4 pb-6">
          <Text className="text-sm font-semibold text-muted mb-3">アカウント</Text>
          <View className="bg-surface rounded-lg border border-border overflow-hidden">
            <View className="px-4 py-4 flex-row items-center justify-between border-b border-border">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="envelope" size={20} color={colors.muted} />
                <Text className="text-foreground">メールアドレス</Text>
              </View>
              <Text className="text-muted text-sm">{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Display Settings Section */}
        <View className="px-4 pb-6">
          <Text className="text-sm font-semibold text-muted mb-3">表示設定</Text>

          {/* Theme Setting */}
          <View className="bg-surface rounded-lg border border-border overflow-hidden mb-3">
            <View className="px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="moon.stars" size={20} color={colors.muted} />
                <Text className="text-foreground font-semibold">テーマ</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-muted text-sm">
                  {settings.theme === "light"
                    ? "ライト"
                    : settings.theme === "dark"
                      ? "ダーク"
                      : "システム"}
                </Text>
                <IconSymbol name="chevron.right" size={16} color={colors.muted} />
              </View>
            </View>
            <View className="px-4 pb-4 gap-2">
              {(["light", "dark", "system"] as const).map((theme) => (
                <Pressable
                  key={theme}
                  onPress={() => updateTheme(theme)}
                  className="flex-row items-center p-2"
                >
                  <View
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${settings.theme === theme ? "bg-primary border-primary" : "border-border"
                      }`}
                  />
                  <Text className="text-foreground text-sm">
                    {theme === "light" ? "ライト" : theme === "dark" ? "ダーク" : "システム"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Font Size Setting */}
          <View className="bg-surface rounded-lg border border-border overflow-hidden mb-3">
            <View className="px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Text className="text-xl font-bold text-muted">T</Text>
                <Text className="text-foreground font-semibold">文字サイズ</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-muted text-sm">
                  {settings.fontSize === "s" ? "小" : settings.fontSize === "m" ? "中" : "大"}
                </Text>
                <IconSymbol name="chevron.right" size={16} color={colors.muted} />
              </View>
            </View>
            <View className="px-4 pb-4 gap-2">
              {(["s", "m", "l"] as const).map((size) => (
                <Pressable
                  key={size}
                  onPress={() => updateFontSize(size)}
                  className="flex-row items-center p-2"
                >
                  <View
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${settings.fontSize === size ? "bg-primary border-primary" : "border-border"
                      }`}
                  />
                  <Text className="text-foreground text-sm">
                    {size === "s" ? "小" : size === "m" ? "中" : "大"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Week Start Setting */}
          <View className="bg-surface rounded-lg border border-border overflow-hidden mb-3">
            <View className="px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="calendar" size={20} color={colors.muted} />
                <Text className="text-foreground font-semibold">週の開始</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-muted text-sm">
                  {settings.weekStart === "mon" ? "月曜" : "日曜"}
                </Text>
                <IconSymbol name="chevron.right" size={16} color={colors.muted} />
              </View>
            </View>
            <View className="px-4 pb-4 gap-2">
              {(["mon", "sun"] as const).map((start) => (
                <Pressable
                  key={start}
                  onPress={() => updateWeekStart(start)}
                  className="flex-row items-center p-2"
                >
                  <View
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${settings.weekStart === start ? "bg-primary border-primary" : "border-border"
                      }`}
                  />
                  <Text className="text-foreground text-sm">
                    {start === "mon" ? "月曜日" : "日曜日"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Notification Settings Section */}
        <View className="px-4 pb-6">
          <Text className="text-sm font-semibold text-muted mb-3">通知設定</Text>
          <View className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <IconSymbol name="bell" size={20} color={colors.muted} />
              <Text className="text-foreground font-semibold">リマインダー</Text>
            </View>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={updateReminderEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Data Management Section */}
        <View className="px-4 pb-6">
          <Text className="text-sm font-semibold text-muted mb-3">データ管理</Text>

          {/* Clear Data */}
          <Pressable
            onPress={handleClearData}
            className="bg-surface rounded-lg p-4 border border-error flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="trash" size={20} color={colors.error} />
              <Text className="font-semibold text-error">データを初期化</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.error} />
          </Pressable>
        </View>

        {/* Version Info */}
        <View className="px-4 pb-6 items-center">
          <Text className="text-xs text-muted">バージョン 1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
