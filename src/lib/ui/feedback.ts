export function createTimedFeedback(setter: (value: string) => void, message: string, delay = 2000) {
  setter(message);
  return setTimeout(() => setter(""), delay);
}
