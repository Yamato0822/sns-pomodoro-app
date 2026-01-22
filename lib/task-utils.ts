import { Task } from "./task-context";

/**
 * タスク実行可否を判定する関数
 * 
 * ルール：
 * 1. scheduled_atが未来のタスク：実行不可（▶ボタン無効化）
 * 2. 今日かつhas_time=false：実行可能（▶ボタン有効）
 * 3. 今日かつhas_time=true で scheduled_at > now：実行不可（▶ボタン無効化）
 * 4. 過去のタスク：実行可能（▶ボタン有効）
 */
export function isTaskExecutable(task: Task): boolean {
  if (!task.scheduledAt) {
    // スケジュール未設定：実行可能
    return true;
  }

  const now = new Date();
  const taskDate = new Date(task.scheduledAt);

  // タスクの日付を取得（時刻を無視）
  const taskDateOnly = new Date(taskDate);
  taskDateOnly.setHours(0, 0, 0, 0);

  // 今日の日付を取得
  const todayDateOnly = new Date(now);
  todayDateOnly.setHours(0, 0, 0, 0);

  // 明日の日付を取得
  const tomorrowDateOnly = new Date(now);
  tomorrowDateOnly.setDate(tomorrowDateOnly.getDate() + 1);
  tomorrowDateOnly.setHours(0, 0, 0, 0);

  // ルール1: scheduled_atが未来のタスク（明日以降）：実行不可
  if (taskDateOnly >= tomorrowDateOnly) {
    return false;
  }

  // ルール2: 今日かつhas_time=false：実行可能
  if (taskDateOnly.getTime() === todayDateOnly.getTime() && !task.hasTime) {
    return true;
  }

  // ルール3: 今日かつhas_time=true で scheduled_at > now：実行不可
  if (
    taskDateOnly.getTime() === todayDateOnly.getTime() &&
    task.hasTime &&
    taskDate > now
  ) {
    return false;
  }

  // ルール4: 過去のタスク（今日より前）：実行可能
  if (taskDateOnly < todayDateOnly) {
    return true;
  }

  // ルール3の続き: 今日かつhas_time=true で scheduled_at <= now：実行可能
  if (
    taskDateOnly.getTime() === todayDateOnly.getTime() &&
    task.hasTime &&
    taskDate <= now
  ) {
    return true;
  }

  return true;
}

/**
 * タスク実行不可の理由を取得する関数
 */
export function getTaskExecutionBlockReason(task: Task): string | null {
  if (!task.scheduledAt) {
    return null;
  }

  const now = new Date();
  const taskDate = new Date(task.scheduledAt);

  // タスクの日付を取得（時刻を無視）
  const taskDateOnly = new Date(taskDate);
  taskDateOnly.setHours(0, 0, 0, 0);

  // 今日の日付を取得
  const todayDateOnly = new Date(now);
  todayDateOnly.setHours(0, 0, 0, 0);

  // 明日の日付を取得
  const tomorrowDateOnly = new Date(now);
  tomorrowDateOnly.setDate(tomorrowDateOnly.getDate() + 1);
  tomorrowDateOnly.setHours(0, 0, 0, 0);

  // scheduled_atが未来のタスク（明日以降）
  if (taskDateOnly >= tomorrowDateOnly) {
    const month = taskDate.getMonth() + 1;
    const day = taskDate.getDate();
    return `${month}/${day}に実行予定`;
  }

  // 今日かつhasTime=true で scheduled_at > now
  if (
    taskDateOnly.getTime() === todayDateOnly.getTime() &&
    task.hasTime &&
    taskDate > now
  ) {
    const hour = String(taskDate.getHours()).padStart(2, "0");
    const minute = String(taskDate.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}に実行予定`;
  }

  return null;
}

/**
 * タスクの実行状態を取得する関数
 */
export function getTaskExecutionStatus(
  task: Task
): "executable" | "scheduled" | "time-locked" {
  if (!task.scheduledAt) {
    return "executable";
  }

  const now = new Date();
  const taskDate = new Date(task.scheduledAt);

  // タスクの日付を取得（時刻を無視）
  const taskDateOnly = new Date(taskDate);
  taskDateOnly.setHours(0, 0, 0, 0);

  // 今日の日付を取得
  const todayDateOnly = new Date(now);
  todayDateOnly.setHours(0, 0, 0, 0);

  // 明日の日付を取得
  const tomorrowDateOnly = new Date(now);
  tomorrowDateOnly.setDate(tomorrowDateOnly.getDate() + 1);
  tomorrowDateOnly.setHours(0, 0, 0, 0);

  // scheduled_atが未来のタスク（明日以降）
  if (taskDateOnly >= tomorrowDateOnly) {
    return "scheduled";
  }

  // 今日かつhasTime=true で scheduled_at > now
  if (
    taskDateOnly.getTime() === todayDateOnly.getTime() &&
    task.hasTime &&
    taskDate > now
  ) {
    return "time-locked";
  }

  return "executable";
}
