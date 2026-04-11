export function timeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return "A l instant";
  if (diff < 3600) return "Il y a " + Math.floor(diff / 60) + " min";
  if (diff < 86400) return "Il y a " + Math.floor(diff / 3600) + "h";
  if (diff < 604800) return "Il y a " + Math.floor(diff / 86400) + "j";
  return then.toLocaleDateString("fr-FR");
}

export function getRelativeDateLabel(dateInput: string) {
  const date = new Date(dateInput);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}
