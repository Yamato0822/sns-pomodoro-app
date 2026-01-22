import { ScrollView, Text, View, Pressable, TextInput, Dimensions, Animated } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useClerkAuthState } from "@/hooks/use-clerk-auth";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTasks, Task } from "@/lib/task-context";
import { useRouter } from "expo-router";
import { TaskDetailModal } from "@/components/task-detail-modal";
import { ScheduleBottomSheet } from "@/components/schedule-bottom-sheet";
import { isTaskExecutable } from "@/lib/task-utils";
import { isTaskEnabled } from "@/lib/task-execution-utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 24;
const VISIBLE_ITEMS = 7;
const ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2) / VISIBLE_ITEMS;

export default function HomeScreen() {
  const { user, isAuthenticated, loading } = useClerkAuthState();
  const colors = useColors();
  const router = useRouter();
  const {
    tasks,
    getTodaysTasks,
    getCompletionRate,
    addTask,
    toggleTaskCompletion,
  } = useTasks();
  const [taskTitle, setTaskTitle] = useState("");
  const [completionRate, setCompletionRate] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedNextWeek, setExpandedNextWeek] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scheduleBottomSheetVisible, setScheduleBottomSheetVisible] =
    useState(false);
  const [pendingSchedule, setPendingSchedule] = useState<{
    date: Date;
    hasTime: boolean;
  } | null>(null);
  const { updateTask, deleteTask } = useTasks();

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setCompletionRate(getCompletionRate());
  }, [tasks, getCompletionRate]);

  const todaysTasks = getTodaysTasks();
  const pendingTasks = todaysTasks.filter((t) => !t.isCompleted);

  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    // Generate dates around today for scrolling context
    for (let i = -15; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleScheduleApply = useCallback((date: Date, hasTime: boolean) => {
    setPendingSchedule({ date, hasTime });
  }, []);

  const handleAddTask = useCallback(() => {
    if (taskTitle.trim()) {
      const date = pendingSchedule?.date || selectedDate;
      const hasTime = pendingSchedule?.hasTime || false;
      addTask(taskTitle, date, hasTime);
      setTaskTitle("");
      setPendingSchedule(null);
    }
  }, [taskTitle, pendingSchedule, selectedDate, addTask]);

  const getScheduleChip = () => {
    if (!pendingSchedule) return null;
    const date = pendingSchedule.date;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (pendingSchedule.hasTime) {
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${month}/${day} ${hour}:${minute}`;
    }
    return `${month}/${day}`;
  };

  const getNextWeekTasks = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      const taskDate = task.scheduledAt ? new Date(task.scheduledAt) : new Date();
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= tomorrow;
    });
  };

  const handleTaskPress = useCallback((task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  }, []);

  const handleTaskUpdate = useCallback(
    (updatedTask: Task) => {
      updateTask(updatedTask.id, updatedTask);
      setModalVisible(false);
      setSelectedTask(null);
    },
    [updateTask]
  );

  const handleTaskDelete = useCallback(
    (taskId: string) => {
      deleteTask(taskId);
      setModalVisible(false);
      setSelectedTask(null);
    },
    [deleteTask]
  );

  const handleQuickStart = useCallback(() => {
    router.push("/pomodoro");
  }, [router]);

  const handlePlayButtonPress = useCallback((task: Task) => {
    router.push("/pomodoro");
  }, [router]);

  const isSelected = (day: Date) => {
    return day.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0];
  };

  return (
    <ScreenContainer className="p-0 bg-slate-950">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Fisheye Calendar Strip */}
        <View style={{ height: 140, justifyContent: 'center' }}>
          <Animated.FlatList
            data={calendarDays}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.toISOString()}
            contentContainerStyle={{
              paddingHorizontal: HORIZONTAL_PADDING + (VISIBLE_ITEMS - 1) * ITEM_WIDTH / 2,
              alignItems: 'center'
            }}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
              handleDateSelect(calendarDays[index + 15]); // Adjust for center index offset
            }}
            renderItem={({ item, index }) => {
              const isDaySelected = item.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0];

              // Calculate scale based on distance from center
              const inputRange = [
                (index - 3) * ITEM_WIDTH,
                index * ITEM_WIDTH,
                (index + 3) * ITEM_WIDTH,
              ];

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.8, 1.2, 0.8],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });

              return (
                <Pressable onPress={() => handleDateSelect(item)}>
                  <Animated.View
                    style={{
                      width: ITEM_WIDTH - 8,
                      height: 100,
                      marginHorizontal: 4,
                      borderRadius: 32,
                      backgroundColor: isDaySelected ? 'white' : 'rgba(15, 23, 42, 0.8)',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 16,
                      transform: [{ scale }],
                      opacity,
                    }}
                  >
                    <Text
                      className={`text-2xl font-black ${isDaySelected ? "text-slate-950" : "text-white/60"
                        }`}
                    >
                      {item.getDate()}
                    </Text>
                    <View className={`w-2 h-2 rounded-full ${isDaySelected ? "bg-slate-950" : "bg-white/20"}`} />
                  </Animated.View>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Completion Rate */}
        <View className="px-5 mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-bold text-white/40 uppercase tracking-widest">
              達成率
            </Text>
            <Text className="text-base font-black text-white">
              {completionRate}%
            </Text>
          </View>
          <View className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <View
              style={{
                height: "100%",
                width: `${completionRate}%`,
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </View>

        {/* Task Input Section */}
        <View className="px-5 mb-6">
          <View className="flex-row gap-3 items-center">
            <View className="flex-1 flex-row items-center bg-slate-900/50 rounded-2xl px-4 border border-white/5">
              <TextInput
                placeholder="タスク追加"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={taskTitle}
                onChangeText={setTaskTitle}
                className="flex-1 py-4 text-base text-white font-medium"
              />
            </View>

            <Pressable
              onPress={() => setScheduleBottomSheetVisible(true)}
              className="w-14 h-14 rounded-2xl bg-slate-900/50 justify-center items-center border border-white/5 active:bg-slate-800"
            >
              <IconSymbol name="calendar" size={24} color="rgba(255,255,255,0.6)" />
            </Pressable>

            <Pressable
              onPress={handleQuickStart}
              className="w-14 h-14 rounded-2xl bg-cyan-500 justify-center items-center shadow-lg shadow-cyan-500/20 active:bg-cyan-400"
            >
              <IconSymbol name="play.fill" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {pendingSchedule && (
            <View className="mt-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl self-start">
              <Text className="text-sm font-bold text-cyan-400">
                {getScheduleChip()}
              </Text>
            </View>
          )}
        </View>

        {/* Add Task Button (Floating style when typing) */}
        {taskTitle.trim() && (
          <View className="px-5 mb-6">
            <Pressable
              onPress={handleAddTask}
              className="py-4 bg-white rounded-2xl items-center active:opacity-90"
            >
              <Text className="text-lg font-black text-slate-950">
                タスクを追加
              </Text>
            </Pressable>
          </View>
        )}

        {/* Today's Tasks */}
        <View className="px-5 mb-6">
          <Text className="text-xl font-black text-white mb-4 tracking-tight">
            今日のタスク
          </Text>
          {pendingTasks.length === 0 ? (
            <View className="py-10 items-center justify-center bg-slate-900/30 rounded-3xl border border-dashed border-white/5">
              <Text className="text-sm font-bold text-white/20 italic">
                タスクがありません
              </Text>
            </View>
          ) : (
            pendingTasks.map((task) => (
              <Pressable
                key={task.id}
                onPress={() => handleTaskPress(task)}
                className="flex-row items-center py-4 px-5 bg-slate-900/80 rounded-3xl mb-3 border border-white/5 active:bg-slate-800"
              >
                <Pressable
                  onPress={() => toggleTaskCompletion(task.id)}
                  className="mr-4 w-6 h-6 rounded-full border-2 border-white/10 items-center justify-center"
                >
                  {task.isCompleted && (
                    <View className="w-3 h-3 rounded-full bg-cyan-500" />
                  )}
                </Pressable>
                <Text className="flex-1 text-base font-bold text-white">
                  {task.title}
                </Text>
                <Pressable
                  onPress={() => handlePlayButtonPress(task)}
                  className="w-10 h-10 rounded-xl bg-white/5 justify-center items-center active:bg-white/10"
                >
                  <IconSymbol name="play.fill" size={16} color="rgba(255,255,255,0.6)" />
                </Pressable>
              </Pressable>
            ))
          )}
        </View>

        {/* Next Week Tasks */}
        <View className="px-5 mb-10">
          <Pressable
            onPress={() => setExpandedNextWeek(!expandedNextWeek)}
            className="flex-row justify-between items-center py-4"
          >
            <Text className="text-xl font-black text-white tracking-tight">
              次週
            </Text>
            <IconSymbol
              name={expandedNextWeek ? "chevron.up" : "chevron.down"}
              size={20}
              color="rgba(255,255,255,0.3)"
            />
          </Pressable>

          {expandedNextWeek && (
            <View>
              {getNextWeekTasks().length === 0 ? (
                <Text className="text-sm font-bold text-white/20 text-center py-4 italic">
                  タスクがありません
                </Text>
              ) : (
                getNextWeekTasks().map((task) => (
                  <Pressable
                    key={task.id}
                    onPress={() => handleTaskPress(task)}
                    className="py-4 px-5 bg-slate-900/40 rounded-2xl mb-2 border border-white/5"
                  >
                    <Text className="text-base font-bold text-white/70">
                      {task.title}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Schedule Bottom Sheet */}
      <ScheduleBottomSheet
        visible={scheduleBottomSheetVisible}
        onClose={() => setScheduleBottomSheetVisible(false)}
        onApply={handleScheduleApply}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          visible={modalVisible}
          task={selectedTask}
          onClose={() => setModalVisible(false)}
          onSave={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </ScreenContainer>
  );
}
