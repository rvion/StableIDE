import type { Tint } from './Tint'

import Color from 'colorjs.io'

import { getNum } from '../tinyCSS/CSSVar'
import { clamp } from '../utils/clamp'

const white = new Color('oklch', [1, 0, 0])
const black = new Color('oklch', [0, 0, 0])

type TintDir = -1 | 1 // 'ligher' | 'darker' | 'auto'

export class Kolor implements Tint {
   static fromString = (str: string): Kolor => {
      try {
         const color = new Color(str)
         const [l, c, h] = color.oklch
         return new Kolor(l!, c!, isNaN(h!) ? 0 : h!)
      } catch (e) {
         console.error(`[🔴] getLCHFromString FAILURE (string is: "${str}")`)
         console.error(`[🔴] Real Error: ${e}`)
         return new Kolor(0.5, 0.1, 0)
      }
   }

   get color(): Color {
      return new Color('oklch', [this.lightness, this.chroma, this.hue])
   }

   get isInRec2020Gamut(): boolean { return this.color.inGamut('rec2020') } // prettier-ignore
   get isInP3Gamut(): boolean { return this.color.inGamut('p3') } // prettier-ignore
   get isInRBGGamut(): boolean { return this.color.inGamut('srgb') } // prettier-ignore

   clampToRec2020 = (): Kolor => {
      if (this.isInRec2020Gamut) return this
      const clamped = this.color.toGamut('rec2020')
      return new Kolor(clamped.oklch[0]!, clamped.oklch[1]!, clamped.oklch[2]!)
   }
   clampToP3 = (): Kolor => {
      if (this.isInP3Gamut) return this
      const clamped = this.color.toGamut('p3')
      return new Kolor(clamped.oklch[0]!, clamped.oklch[1]!, clamped.oklch[2]!)
   }
   clampToRGB = (): Kolor => {
      if (this.isInRBGGamut) return this
      const clamped = this.color.toGamut('srgb')
      return new Kolor(clamped.oklch[0]!, clamped.oklch[1]!, clamped.oklch[2]!)
   }

   constructor(
      /** 0 to 1 */
      public lightness: number,
      /** 0 to 1 */
      public chroma: number,
      /** 0 to 360 or -180 to 180 */
      public hue: number,
      /** 0 to 1 */
      public opacity = 1,
   ) {
      this.ASSERT_VALID()
   }

   private ASSERT_VALID = (): void => {
      if (isNaN(this.lightness)) {
         this.lightness = 0
         // throw new Error('isNaN(this.lightness)')
      }
      if (isNaN(this.chroma)) throw new Error('isNaN(this.chroma)')
      if (isNaN(this.hue)) throw new Error('isNaN(this.hue)')
      if (this.lightness < 0) {
         console.warn(this, `Had an invalid lightness and was clamped from ${this.lightness}=>0`)
         this.lightness = 0
      }
      if (this.lightness > 1) {
         console.warn(this, `Had an invalid lightness and was clamped from ${this.lightness}=>1`)
         this.lightness = 1
      }
      if (this.chroma < 0) {
         console.warn(this, `Had an invalid chroma and was clamped from ${this.chroma}=>0`)
         this.chroma = 0
      }
      if (this.chroma > 1) {
         console.warn(this, `Had an invalid chroma and was clamped from ${this.chroma}=>1`)
         this.chroma = 1
      }
      // if (this.lightness < 0) throw new Error(`this.lightness (${this.lightness}) < 0`)
      // if (this.lightness > 1) throw new Error(`this.lightness (${this.lightness}) > 1`)
      // if (this.chroma < 0) throw new Error(`this.chroma (${this.chroma}) < 0`)
      // if (this.chroma > 1) throw new Error(`this.chroma (${this.chroma}) > 1`)
      // if (this.hue < 0) throw new Error(`this.hue (${this.hue}) < 0`)
      // if (this.hue > 360) throw new Error(`this.hue (${this.hue}) > 360`)
   }

   toOKLCH = (): string => {
      const l = clamp(this.lightness, 0.0001, 0.9999).toFixed(3)
      const c = this.chroma.toFixed(3)
      const h = this.hue.toFixed(3)
      if (this.opacity === 1) return `oklch(${l} ${c} ${h})`

      const a = this.opacity.toFixed(3)
      return `oklch(${l} ${c} ${h} / ${a})`
   }

   /** true if strictly same values */
   isSame = (b: Kolor): boolean => {
      if (this.lightness !== b.lightness) return false
      if (this.chroma !== b.chroma) return false
      if (this.hue !== b.hue) return false
      return true
   }

   tintBg = (b: Maybe<Tint>, dir?: TintDir): Kolor => this.tint(b, 'Bg', dir)
   tintFg = (b: Maybe<Tint>, dir?: TintDir): Kolor => this.tint(b, 'Fg', dir)
   tintBorder = (b: Maybe<Tint>, dir?: TintDir): Kolor => this.tint(b, 'Bg', dir)

   tint = (
      //
      b: Maybe<Tint>,
      usage: 'Fg' | 'Bg',
      dir_?: TintDir,
   ): Kolor => {
      if (b == null) return this

      const chroma = getNum(b.chroma) ?? this.chroma * getNum(b.chromaBlend, 1)
      const hue = getNum(b.hue) ?? this.hue + getNum(b.hueShift, 0)

      let lightness: number = this.lightness
      if (b.lightness != null) {
         lightness = getNum(b.lightness, 0)
      } else if (b.contrast == null || b.contrast == 0) {
         lightness = this.lightness
      } else {
         const cr = getNum(b.contrast)
         // console.log(`[🤠] dir`, dir_)
         const x1 = this.color
            .clone()
            // .set({ 'oklch.l': (v: any) => (v += cr) })
            .set({ 'hct.t': (v: any) => (v += cr * 100) })
            .toGamut('srgb')

         const x2 = this.color
            .clone()
            // .set({ 'oklch.l': (v: any) => (v -= cr) })
            .set({ 'hct.t': (v: any) => (v -= cr * 100) })
            .toGamut('srgb')

         const apcaWx1 = Math.abs(this.color.contrastAPCA(x1))
         const apcaWx2 = Math.abs(this.color.contrastAPCA(x2))
         const x = dir_ == null ? (apcaWx1 > apcaWx2 ? x1 : x2) : dir_ === 1 ? x1 : x2
         lightness = x.l
      }

      const clamped = new Color('oklch', [lightness, chroma, hue]).toGamut('srgb')
      // console.log(`[🤠] `, xxxx.oklch[0]!, xxxx.oklch[1]!, or0(xxxx.oklch[2]!))
      const next = new Kolor(clamped.oklch[0]!, clamped.oklch[1]!, or0(clamped.oklch[2]!))

      if (!next.isInRBGGamut) console.error(`[🔴] ${usage} out of gamut: ${next.toOKLCH()} - ${next.webLink}`)
      return next
   }

   get webLink(): string {
      return `https://oklch.com/#${(this.lightness * 100).toFixed(2)},${this.chroma.toFixed(3)},${this.hue.toFixed(3)},100`
   }
   /*
    * This slightly favors using the darker color by adding a small
    * float to ensure we always have -1/1 from Math.sign
    */
   private _autoContrast_v1(lightness: number, contrast: number): number {
      const start = lightness
      const dir = Math.sign(0.5 - lightness - 0.00001)
      const final = start + dir * contrast
      return clamp(final, 0, 1)
   }

   /** super dumb */
   private _autoContrast_v2 = (contrast: number, usage: 'Fg' | 'Bg'): number => {
      const col = this.color
      let candidate = this.color.clone()
      const distToBlack = this.color.distance(black)
      const distToWhite = this.color.distance(white)
      const desired = Math.abs(contrast)
      let bestContrastDiff = Infinity
      let bestContrast = -Infinity
      let bestCandidate = candidate
      let min = -100,
         max = 100,
         step = 1
      if (desired < 0.1) {
         min = -20
         max = 20
         step = 0.02
      }
      const dir = distToBlack < distToWhite ? 1 : -1
      for (let i = min; i < max; i += step) {
         if (this.lightness + 0.01 * i * dir < 0 || this.lightness + 0.01 * i * dir > 1) continue
         candidate = col
            .clone()
            .set({ l: (l: any) => l + 0.01 * i * dir })
            .toGamut('srgb')
         const obtained =
            usage === 'Fg' //
               ? Math.abs(col.contrastAPCA(candidate) / 108)
               : col.contrastWCAG21(candidate) / 21
         // console.log(`[🤠] trying`, candidate.toString({ format: 'oklch' }), obtained)
         const contrastDiff = Math.abs(Math.abs(desired) - Math.abs(obtained))
         if (contrastDiff < bestContrastDiff) {
            bestContrastDiff = contrastDiff
            bestContrast = obtained
            bestCandidate = candidate.clone()
         }
      }
      console.log(`[🤠] best:`, { desired, obtained: bestContrast, diff: bestContrastDiff })
      return bestCandidate.oklch[0]!
   }
}

const or0 = (n: number): number => (n == null ? 0 : isNaN(n) ? 0 : n)
