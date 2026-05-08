'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

type Scheme = 'analogous' | 'complementary' | 'triadic' | 'split' | 'monochromatic'

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let hue = 0, sat = 0
  const lit = (max + min) / 2
  if (max !== min) {
    const d = max - min
    sat = lit > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) hue = ((b - r) / d + 2) / 6
    else hue = ((r - g) / d + 4) / 6
  }
  return [Math.round(hue * 360), Math.round(sat * 100), Math.round(lit * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(5, Math.min(95, l)) / 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

function generatePalette(hex: string, scheme: Scheme): string[] {
  const [h, s, l] = hexToHsl(hex)
  switch (scheme) {
    case 'analogous':
      return [-60, -30, 0, 30, 60].map(d => hslToHex(h + d, s, l))
    case 'complementary':
      return [-30, 0, 30, 165, 195].map(d => hslToHex(h + d, s, l))
    case 'triadic':
      return [0, 60, 120, 180, 240].map(d => hslToHex(h + d, s, l))
    case 'split':
      return [0, 60, 150, 180, 210].map(d => hslToHex(h + d, s, l))
    case 'monochromatic':
      return [25, 40, 55, 70, 85].map(lt => hslToHex(h, s, lt))
    default:
      return []
  }
}

export default function Home() {
  const { t, lang } = useI18n()
  const [baseHex, setBaseHex] = useState('#3b82f6')
  const [scheme, setScheme] = useState<Scheme>('analogous')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const palette = generatePalette(baseHex, scheme)
  const [bh, bs, bl] = hexToHsl(baseHex)

  const copyHex = (hex: string, idx: number) => {
    navigator.clipboard.writeText(hex.toUpperCase()).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    })
  }

  const schemes: [Scheme, string, string][] = [
    ['analogous', lang === 'ja' ? '類似色' : 'Analogous', lang === 'ja' ? '隣の色で統一感' : 'Adjacent colors'],
    ['complementary', lang === 'ja' ? '補色' : 'Complementary', lang === 'ja' ? '反対色で対比' : 'Opposite colors'],
    ['triadic', lang === 'ja' ? '三角配色' : 'Triadic', lang === 'ja' ? '3色バランス' : '3-color balance'],
    ['split', lang === 'ja' ? '分裂補色' : 'Split-Comp', lang === 'ja' ? '活気ある対比' : 'Vibrant contrast'],
    ['monochromatic', lang === 'ja' ? '単色' : 'Monochromatic', lang === 'ja' ? '同色の明暗' : 'Same hue tones'],
  ]

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{t.appName}</h1>
        <p className="text-base text-gray-500">{t.tagline}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {lang === 'ja' ? 'ベースカラーを選ぶ' : 'Choose Base Color'}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={baseHex}
            onChange={e => setBaseHex(e.target.value)}
            className="w-16 h-16 rounded-xl cursor-pointer border-2 border-gray-200"
            aria-label="base color picker"
          />
          <div>
            <div className="text-xl font-mono font-bold text-gray-800">{baseHex.toUpperCase()}</div>
            <div className="text-xs text-gray-500 mt-0.5">H:{bh}° S:{bs}% L:{bl}%</div>
            <div className="text-xs text-gray-500">{hexToRgb(baseHex)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {lang === 'ja' ? 'カラースキームを選ぶ' : 'Choose Color Scheme'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {schemes.map(([s, label, desc]) => (
            <button
              key={s}
              onClick={() => setScheme(s)}
              className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors min-h-[44px] ${scheme === s ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="font-medium">{label}</div>
              <div className={`text-xs ${scheme === s ? 'text-pink-100' : 'text-gray-400'}`}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-3">
        {palette.map((hex, i) => (
          <button
            key={i}
            onClick={() => copyHex(hex, i)}
            className="group flex flex-col items-center gap-2 min-h-[44px]"
            aria-label={`copy ${hex}`}
          >
            <div
              className="w-full aspect-square rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all flex items-center justify-center"
              style={{ backgroundColor: hex }}
            >
              {copiedIdx === i && (
                <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">
                  {lang === 'ja' ? 'コピー済' : 'Copied!'}
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-gray-700 text-center">{hex.toUpperCase()}</div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        {lang === 'ja' ? '色をクリックするとHEXコードをコピー' : 'Click a color to copy its HEX code'}
      </p>
    </main>
  )
}
