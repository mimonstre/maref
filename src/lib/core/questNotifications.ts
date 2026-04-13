const QUEST_EVENT = "maref:quest-unlocked";

export type QuestNotificationDetail = {
  message: string;
};

export function emitQuestUnlocked(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<QuestNotificationDetail>(QUEST_EVENT, { detail: { message } }));
}

export function onQuestUnlocked(listener: (detail: QuestNotificationDetail) => void) {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<QuestNotificationDetail>;
    if (customEvent.detail?.message) {
      listener(customEvent.detail);
    }
  };

  window.addEventListener(QUEST_EVENT, handler as EventListener);
  return () => window.removeEventListener(QUEST_EVENT, handler as EventListener);
}
