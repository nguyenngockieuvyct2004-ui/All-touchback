let listeners = [];
let idCounter = 1;

// Configurable position for toast container
const POSITIONS = new Set([
  "top-right",
  "top-left",
  "top-center",
  "bottom-right",
  "bottom-left",
  "bottom-center",
]);
let config = { position: "top-right" };
try {
  const saved = localStorage.getItem("tb-toast-pos");
  if (saved && POSITIONS.has(saved)) config.position = saved;
} catch {}
let cfgListeners = [];

export function showToast({
  type = "info",
  title,
  message,
  duration = 2600,
} = {}) {
  const id = idCounter++;
  const item = { id, type, title, message, duration };
  listeners.forEach((fn) => fn({ action: "add", item }));
  if (duration > 0) {
    setTimeout(() => {
      listeners.forEach((fn) => fn({ action: "remove", id }));
    }, duration);
  }
  return id;
}

export function removeToast(id) {
  listeners.forEach((fn) => fn({ action: "remove", id }));
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((x) => x !== fn);
  };
}

export function getToastConfig() {
  return { ...config };
}

export function subscribeConfig(fn) {
  cfgListeners.push(fn);
  return () => {
    cfgListeners = cfgListeners.filter((x) => x !== fn);
  };
}

export function setToastPosition(pos) {
  if (!POSITIONS.has(pos)) return;
  config = { ...config, position: pos };
  try {
    localStorage.setItem("tb-toast-pos", pos);
  } catch {}
  cfgListeners.forEach((fn) => fn({ ...config }));
}

export const toast = {
  info: (msg, title = "Thông báo") =>
    showToast({ type: "info", title, message: msg }),
  success: (msg, title = "Thành công") =>
    showToast({ type: "success", title, message: msg }),
  warn: (msg, title = "Lưu ý") =>
    showToast({ type: "warn", title, message: msg }),
  error: (msg, title = "Lỗi") =>
    showToast({ type: "error", title, message: msg, duration: 4000 }),
  setPosition: (pos) => setToastPosition(pos),
};
