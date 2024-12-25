import Color, { type SpaceAccessor } from 'colorjs.io'
import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { createRef, useEffect, useMemo, useRef, useState } from 'react'

import { Frame } from '../frame/Frame'
import { InputStringUI } from '../input-string/InputStringUI'
import { Kolor } from '../kolor/Kolor'

// TODO: Hue/Saturation need to be stored in a state when opened to allow modifying it when #000, since the color property is going to constantly return 0,0

type ColorPickerProps = {
   color: Kolor
   onColorChange: (value: string) => void
}

class ColorPickerState {
   color: Color

   /** Previous color to return to when cancelling */
   pcolor: Color | undefined
   onColorChange: (value: string) => void
   cancelled: boolean = false

   /** Hue/Saturation circle Reference */
   HSRef = createRef<HTMLCanvasElement>()
   /** Value bar Reference */
   VRef = createRef<HTMLCanvasElement>()

   startY: number = 0
   startX: number = 0
   offsetX: number = 0
   offsetY: number = 0

   canvas: HTMLCanvasElement | undefined | null

   constructor(public props: ColorPickerProps) {
      this.color = props.color.color
      this.onColorChange = props.onColorChange

      makeAutoObservable(this)
   }

   startHueSaturation = (e: MouseEvent): void => {
      this.canvas = this.HSRef.current
      window.document.addEventListener('mousemove', this.handleHueSaturation, true)
      window.document.addEventListener('pointerup', this.stopHueSaturation, true)

      if (!this.HSRef || !this.pcolor) {
         return
      }

      if (!this.canvas) {
         return
      }

      const canvas = this.canvas

      const phsv = ensureHSV(this.pcolor.hsv)

      const rect = canvas.getBoundingClientRect()
      this.startX = e.clientX - rect.left
      this.startY = e.clientY - rect.top
   }

   handleHueSaturation = (e: MouseEvent): void => {
      e.stopPropagation()
      e.preventDefault()

      if (!this.HSRef || !this.pcolor) {
         return
      }

      this.offsetX += e.movementX
      this.offsetY += e.movementY

      const phsv = ensureHSV(this.pcolor.hsv)

      const x = this.startX + this.offsetX
      const y = this.startY + this.offsetY

      const radius = CANVASSIZE / 2

      // Calculate relative position
      const dx = x - radius
      const dy = y - radius
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Saturation is the distance from the center normalized to the radius
      const saturation = Math.min(1, distance / radius)

      // Hue is the angle from the center (in degrees, 0–360)
      let hue = Math.atan2(dy, dx) * (180 / Math.PI)

      // Adjust 90 degrees (Probably arbitrary, but I'm literally just copying how blender "looks", their code is probably cleaner cause they actually know math there LMAO)
      hue = (hue - 90) % 360
      if (hue < 0) {
         hue += 360
      }

      const nCol = new Color('hsv', [hue, saturation * 100, phsv.v]).oklch

      this.onColorChange(`oklch(${nCol[0]} ${nCol[1]}, ${nCol[2]})`)
   }

   //    startLightness = (e: MouseEvent): void => {
   //       if (!this.VRef || !this.pcolor) {
   //          return
   //       }

   //       const canvas = this.VRef.current
   //       if (!canvas) return

   //       const rect = canvas.getBoundingClientRect()
   //       const y = e.clientY - rect.top
   //       const lightness = Math.round((1 - y / CANVASSIZE) * 100)

   //       const phsv = ensureHSV(this.pcolor.hsv)
   //       const newColor = new Color('hsv', [phsv.h, phsv.s, lightness])

   //       const nCol = newColor.oklch
   //       this.onColorChange(`oklch(${nCol[0]} ${nCol[1]}, ${nCol[2]})`)
   //    }

   startLightness = (e: MouseEvent): void => {
      this.canvas = this.VRef.current

      if (!this.VRef || !this.pcolor) {
         return
      }

      const canvas = this.VRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      this.startY = e.clientY - rect.top

      window.document.addEventListener('mousemove', this.handleLightness, true)
      window.document.addEventListener('pointerup', this.stopLightness, true)

      this.handleLightness(e)
   }

   handleLightness = (e: MouseEvent): void => {
      e.stopPropagation()
      e.preventDefault()

      if (!this.pcolor) {
         return
      }

      this.offsetY += e.movementY

      const y = this.startY + this.offsetY
      const value = Math.round((1 - y / CANVASSIZE) * 100)

      const phsv = ensureHSV(this.pcolor.hsv)
      const newColor = new Color('hsv', [phsv.h, phsv.s, value])

      const nCol = newColor.oklch
      this.onColorChange(`oklch(${nCol[0]} ${nCol[1]}, ${nCol[2]})`)
   }

   cancel = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, isLightness: boolean): void => {
      //
   }

   start = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, isLightness: boolean): void => {
      this.pcolor = new Color(this.color.toString())
      this.startX = 0
      this.startY = 0
      this.offsetX = 0
      this.offsetY = 0

      if (isLightness) {
         this.startLightness(e.nativeEvent)
         return
      }

      this.startHueSaturation(e.nativeEvent)
   }

   //    stop = (): void => {
   //       window.document.removeEventListener('mousemove', this.handleHueSaturation, true)
   //       window.document.removeEventListener('pointerup', this.stopHueSaturation, true)
   //       window.document.removeEventListener('mousemove', this.handleLightness, true)
   //       window.document.removeEventListener('pointerup', this.stopLightness, true)
   //    }

   stopLightness = (e: MouseEvent): void => {
      if (e.button != 0) {
         return
      }
      this.handleLightness(e)
      window.document.removeEventListener('mousemove', this.handleLightness, true)
      window.document.removeEventListener('pointerup', this.stopLightness, true)
   }

   stopHueSaturation = (e: MouseEvent): void => {
      if (e.button != 0) {
         return
      }
      this.handleHueSaturation(e)
      window.document.removeEventListener('mousemove', this.handleHueSaturation, true)
      window.document.removeEventListener('pointerup', this.stopHueSaturation, true)
   }
}

const CANVASSIZE = 200
const BAR_CANVAS_WIDTH = 20

function formatHex(value: number): string {
   const next = Math.round(value * 255)
      .toString(16)
      .toUpperCase()
   // Make sure to always return two characters
   return next.length == 1 ? `${next}${next}` : next
}

function ensureHSV(hsv: SpaceAccessor): { h: number; s: number; v: number } {
   if (!hsv[0]) {
      hsv[0] = 0
   }
   if (!hsv[1]) {
      hsv[1] = 0
   }
   if (!hsv[2]) {
      hsv[2] = 0
   }

   return { h: hsv[0], s: hsv[1], v: hsv[2] }
}

// Global
let mode: 'rgb' | 'hsv' | 'oklch' = 'rgb'

export const ColorPickerUI = observer(function ColorPickerUI_(p: ColorPickerProps) {
   const uist = useMemo(() => new ColorPickerState(p), [])

   // ensure new properties that could change during lifetime of the component stays up-to-date in the stable state.
   runInAction(() => Object.assign(uist.props, p))

   mode = 'rgb'
   const [tempHex, setTempHex] = useState<string>('')

   const theme = cushy.preferences.theme.value
   const color = p.color

   // Make sure we have a valid hsv color
   const hsv = ensureHSV(color.color.hsv)

   useEffect(() => {
      //   uist.stop()
      // ------------ Hue/Sat Circle ----------------- //
      const canvas = uist.HSRef.current
      if (!canvas) {
         return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
         return
      }

      const radius = canvas.width / 2

      // Draw conic gradient for hues
      const gradientHue = ctx.createConicGradient(90 * (Math.PI / 180), radius, radius)

      gradientHue.addColorStop(0, 'red')
      gradientHue.addColorStop(1 / 6, 'yellow')
      gradientHue.addColorStop(2 / 6, 'lime')
      gradientHue.addColorStop(3 / 6, 'cyan')
      gradientHue.addColorStop(4 / 6, 'blue')
      gradientHue.addColorStop(5 / 6, 'magenta')
      gradientHue.addColorStop(1, 'red')

      ctx.fillStyle = gradientHue
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw radial gradient for saturation
      const gradientSaturation = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius)
      gradientSaturation.addColorStop(0, `rgba(255, 255, 255, 1)`)
      gradientSaturation.addColorStop(1, `rgba(255, 255, 255, 0)`)

      ctx.fillStyle = gradientSaturation
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // We only want colors to get darker, so multiply
      ctx.globalCompositeOperation = 'multiply'

      // May not be accurate since converting from HSV "lightness" to hsl's, but I don't notice it. It should be fine since it only controls lightness
      ctx.fillStyle = `hsl(0deg 0% ${hsv.v}%)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Go back to normal blend mode
      ctx.globalCompositeOperation = 'source-over'

      // ------------ Lightness Bar ----------------- //
      const valueCanvas = uist.VRef.current
      if (!valueCanvas) {
         return
      }

      const valueCtx = valueCanvas.getContext('2d')
      if (!valueCtx) {
         return
      }

      const gradientLightness = valueCtx.createLinearGradient(0, 0, 0, CANVASSIZE)
      gradientLightness.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradientLightness.addColorStop(1, 'rgba(0, 0, 0, 1)')

      valueCtx.fillStyle = gradientLightness
      valueCtx.fillRect(0, 0, valueCanvas.width, valueCanvas.height)

      const asSRGB = color.color.to('srgb')
      setTempHex(`#${formatHex(asSRGB.r)}${formatHex(asSRGB.g)}${formatHex(asSRGB.b)}`)
   }, [color])

   function getCanvasPositionFromHueSaturation(
      hue: number,
      saturation: number,
      radius: number,
   ): { x: number; y: number } {
      const angle = (hue - 90) * (Math.PI / 180) // Convert hue to radians and rotate red to the bottom
      const distance = saturation * radius // Distance from the center

      const x = radius + distance * Math.cos(angle) // Center x + offset
      const y = radius + distance * Math.sin(angle) // Center y + offset

      return { x, y }
   }

   // -180 to adjust for the rotated hue, saturation should be 0-1, so divide by 100 prob not needed. clean later
   const circlePosition = getCanvasPositionFromHueSaturation(hsv.h - 180, hsv.s / 100, CANVASSIZE / 2)

   return (
      <Frame col tw='gap-2'>
         <Frame row tw='gap-2'>
            <Frame
               tw='relative gap-2 rounded-full !bg-transparent'
               row
               border={{ lightness: 0.5 }}
               dropShadow={theme.global.shadow}
            >
               <div
                  // Hue/Saturation indicator
                  tw='pointer-events-none absolute rounded-full'
                  style={{
                     border: '1px solid grey',
                     top: `${circlePosition.y}px`,
                     left: `${circlePosition.x}px`,
                     transform: 'translateX(-50%) translateY(-50%)',
                  }}
               >
                  <div
                     // Hue/Saturation indicator
                     tw='h-5 w-5 rounded-full'
                     style={{
                        border: '1px solid white',
                        background: color.toOKLCH(),
                     }}
                  />
               </div>

               <canvas
                  ref={uist.HSRef}
                  width={CANVASSIZE}
                  height={CANVASSIZE}
                  style={{
                     borderRadius: '50%',
                     cursor: cushy.preferences.interface.value.useDefaultCursorEverywhere
                        ? 'default'
                        : 'pointer',
                  }}
                  onMouseDown={(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
                     if (e.button == 0) {
                        uist.start(e, false)
                     }
                  }}
               />
            </Frame>
            <div
               // Lightness Bar
               tw='relative !bg-transparent'
            >
               <Frame
                  tw='overflow-clip !bg-transparent'
                  border={{ lightness: 0.1 }}
                  dropShadow={theme.global.shadow}
                  roundness={theme.global.roundness}
               >
                  <canvas
                     ref={uist.VRef}
                     width={BAR_CANVAS_WIDTH}
                     height={CANVASSIZE}
                     onMouseDown={(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
                        if (e.button == 0) {
                           uist.start(e, true)
                        }
                     }}
                  />
               </Frame>
               <div
                  // Lightness indicator
                  tw='pointer-events-none absolute'
                  style={{
                     border: '1px solid black',
                     top: `${CANVASSIZE - (hsv.v / 100) * CANVASSIZE}px`,
                     left: `50%`,
                     transform: 'translateX(-50%) translateY(-50%)',
                  }}
               >
                  <div
                     // Hue/Saturation indicator
                     tw='h-4'
                     style={{
                        // Only add by a multiple of two here, this is centered in the transform above and numbers not divisible by two will be blurry
                        width: BAR_CANVAS_WIDTH + 2,
                        border: '1px solid white',
                        background: `hsl(0deg, 0%, ${hsv.v}%)`,
                     }}
                  />
               </div>
            </div>
         </Frame>
         {/* <Frame align col>
             <InputNumberUI
                text='hue'
                mode='int'
                min={0}
                step={10}
                value={Math.round(hsl[0])}
                onValueChange={(val) => {
                   const adjustedRgb = hslToRGB(val, hsl[1] / 100, hsl[2] / 100)
                   onColorChange(Kolor.fromString(`rgb(${adjustedRgb.r}, ${adjustedRgb.g}, ${adjustedRgb.b})`))
                }}
             />
             <InputNumberUI
                text='saturation'
                mode='float'
                min={0}
                max={1}
                step={0.1}
                value={parseFloatNoRoundingErr(hsl[1] / 100)}
                onValueChange={(val) => {
                   const adjustedRgb = hslToRGB(hsl[0], hsl[1] / 100, hsl[2] / 100)
                   onColorChange(Kolor.fromString(`rgb(${adjustedRgb.r}, ${adjustedRgb.g}, ${adjustedRgb.b})`))
                }}
             />
             <InputNumberUI
                text='lightness'
                mode='float'
                min={0}
                max={0}
                step={0.1}
                value={parseFloatNoRoundingErr(hsl[2] / 100)}
                onValueChange={(val) => {
                   const adjustedRgb = hslToRGB(hsl[0], hsl[1] / 100, val)
                   onColorChange(Kolor.fromString(`rgb(${adjustedRgb.r}, ${adjustedRgb.g}, ${adjustedRgb.b})`))
                }}
             />
          </Frame> */}
         <InputStringUI
            buffered={{
               getTemporaryValue: () => {
                  return tempHex
               },
               setTemporaryValue: (val) => {
                  if (!val) {
                     return
                  }
                  setTempHex(val)
               },
            }}
            onFocus={() => {
               const asSRGB = color.color.to('srgb')
               setTempHex(`#${formatHex(asSRGB.r)}${formatHex(asSRGB.g)}${formatHex(asSRGB.b)}`)
            }}
            onKeyDown={(ev) => {
               if (ev.key == 'Escape') {
                  ev.preventDefault()
                  ev.stopPropagation()
                  return
               }

               if (ev.key != 'Enter') {
                  return
               }

               ev.preventDefault()
               ev.stopPropagation()

               ev.currentTarget.blur()
            }}
            getValue={() => {
               const asSRGB = color.color.to('srgb')

               return `#${formatHex(asSRGB.r)}${formatHex(asSRGB.g)}${formatHex(asSRGB.b)}`
            }}
            setValue={(value) => {
               const col = Kolor.fromString(value)
               const asSRGB = col.color.to('srgb')

               setTempHex(`#${formatHex(asSRGB.r)}${formatHex(asSRGB.g)}${formatHex(asSRGB.b)}`)

               //    uist.onColorChange(col)
            }}
         />
      </Frame>
   )
})
