import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the redirect URL for the current environment
  const getRedirectUrl = () => {
    const scheme = Linking.createURL("/");
    return scheme;
  };

  const handleSignInWithGoogle = async () => {
    if (!isLoaded || !signIn) {
      setError("認証システムが初期化中です。しばらくお待ちください。");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Start OAuth flow with Google
      const redirectUrl = getRedirectUrl();
      console.log("[SignIn] Redirect URL:", redirectUrl);

      const result = await signIn.create({
        strategy: "oauth_google",
        redirectUrl: redirectUrl,
      });

      console.log("[SignIn] OAuth create result:", result?.status);

      // If the OAuth flow is complete, set the active session
      if (result?.status === "complete") {
        console.log("[SignIn] OAuth complete, session created");
        // Set the active session
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
        }
        router.replace("/(tabs)");
      } else {
        console.log("[SignIn] OAuth status:", result?.status);
      }
    } catch (err) {
      console.error("[SignIn] Error:", err);
      const errorMessage = err instanceof Error ? err.message : "ログインに失敗しました";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="pb-24">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 items-center justify-center px-4 py-12">
          {/* Logo / Title */}
          <View className="items-center gap-2 mb-12">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
              <Text className="text-4xl">🍅</Text>
            </View>
            <Text className="text-4xl font-bold text-foreground">Pomodoro Social</Text>
            <Text className="text-sm text-muted text-center mt-2">
              集中力を高めて、みんなで頑張ろう
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="w-full bg-error/10 border border-error rounded-lg p-4 mb-6">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Sign In Button */}
          <Pressable
            onPress={handleSignInWithGoogle}
            disabled={loading || !isLoaded}
            className={`w-full py-4 rounded-lg items-center justify-center mb-4 ${
              loading || !isLoaded ? "bg-primary/50" : "bg-primary"
            }`}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : !isLoaded ? (
              <Text className="text-background font-semibold text-base">読み込み中...</Text>
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">🔐</Text>
                <Text className="text-background font-semibold text-base">Google でログイン</Text>
              </View>
            )}
          </Pressable>

          {/* Info Text */}
          <View className="items-center gap-4 mt-12 px-4">
            <Text className="text-xs text-muted text-center">
              ログインすることで、利用規約とプライバシーポリシーに同意します
            </Text>
            <Text className="text-xs text-muted text-center">
              初めてのご利用の場合は、アカウントが自動作成されます
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
