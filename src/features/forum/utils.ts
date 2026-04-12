export function getForumAvatarColor(name: string) {
  const colors = ["bg-blue-600", "bg-blue-500", "bg-indigo-500", "bg-orange-500", "bg-pink-500", "bg-yellow-500", "bg-red-500", "bg-teal-500"];
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
