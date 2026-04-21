export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function sentenceFromTokens(tokens: string[]): string {
  return tokens.join(" ").replace(/\s+([?.!,])/g, "$1").trim()
}

export function scoreTranscript(expected: string, actual: string): number {
  const a = normalizeText(expected)
  const b = normalizeText(actual)

  if (!a || !b) {
    return 0
  }

  if (a === b) {
    return 1
  }

  const aWords = a.split(" ")
  const bWords = b.split(" ")
  const shared = aWords.filter((word) => bWords.includes(word)).length

  return shared / Math.max(aWords.length, bWords.length)
}
