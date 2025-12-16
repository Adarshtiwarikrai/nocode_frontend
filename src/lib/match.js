export function stripMatch(str, prefix) {
    const regex = new RegExp(`^${prefix}\\s*(.*)`);
    const match = str.match(regex);
    return match
      ? { found: true, text: match[1].trim() }
      : { found: false, text: str };
  }
  