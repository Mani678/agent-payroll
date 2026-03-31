export interface LogEntry {
  timestamp: string;
  level: "info" | "success" | "error" | "warn";
  message: string;
}

const logs: LogEntry[] = [];
let paused = false;

export function log(message: string, level: LogEntry["level"] = "info") {
  const entry: LogEntry = {
    timestamp: new Date().toLocaleTimeString(),
    level,
    message,
  };
  logs.push(entry);
  if (logs.length > 200) logs.shift();
  console.log(`[${entry.level.toUpperCase()}] ${entry.timestamp} ${message}`);
}

export function getLogs(): LogEntry[] {
  return [...logs].reverse();
}

export function isPaused(): boolean {
  return paused;
}

export function setPaused(value: boolean) {
  paused = value;
  log(`scheduler ${value ? "PAUSED by operator" : "RESUMED by operator"}`, value ? "warn" : "success");
}