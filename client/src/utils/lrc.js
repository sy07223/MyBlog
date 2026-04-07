/**
 * 解析 LRC 歌词：[mm:ss.xx] 或 [mm:ss] 文本
 * @param {string} text
 * @returns {{ time: number, text: string }[]}
 */
export function parseLrc(text) {
  if (!text || typeof text !== 'string') return []
  const lines = []
  const re = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)/g
  let m
  while ((m = re.exec(text))) {
    const min = parseInt(m[1], 10)
    const sec = parseInt(m[2], 10)
    const frac = m[3]
      ? parseInt(m[3].padEnd(3, '0').slice(0, 3), 10) / 1000
      : 0
    const t = min * 60 + sec + frac
    const line = (m[4] || '').trim()
    if (line) lines.push({ time: t, text: line })
  }
  return lines.sort((a, b) => a.time - b.time)
}

export function lyricIndexAtTime(t, lines) {
  if (!lines?.length) return -1
  let i = -1
  for (let j = 0; j < lines.length; j++) {
    if (lines[j].time <= t) i = j
    else break
  }
  return i
}
