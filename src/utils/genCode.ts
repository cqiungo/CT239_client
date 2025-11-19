export function generateRoomCode(length = 6) {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((n) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[n % 36])
    .join("");
}

// Dùng:
