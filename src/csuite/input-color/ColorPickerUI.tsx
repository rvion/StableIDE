import Color, { type SpaceAccessor } from 'colorjs.io'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'

import { Frame } from '../frame/Frame'
import { InputStringUI } from '../input-string/InputStringUI'
import { Kolor } from '../kolor/Kolor'

// TODO: Hue/Saturation need to be stored in a state when opened to allow modifying it when #000, since the color property is going to constantly return 0,0

type ColorPickerProps = {
   color: Kolor
   onColorChange: (value: Kolor) => void
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
   mode = 'rgb'
   const hueSatCanvasRef = useRef<HTMLCanvasElement>(null)
   const valueCanvasRef = useRef<HTMLCanvasElement>(null)
   const [tempHex, setTempHex] = useState<string>('')

   const theme = cushy.preferences.theme.value
   const onColorChange = p.onColorChange
   const color = p.color

   // Make sure we have a valid hsv color
   const phsv = ensureHSV(color.color.hsv)

   useEffect(() => {
      // ------------ Hue/Sat Circle ----------------- //
      const canvas = hueSatCanvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

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
      ctx.fillStyle = `hsl(0deg 0% ${phsv.v}%)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Go back to normal blend mode
      ctx.globalCompositeOperation = 'source-over'

      // ------------ Lightness Bar ----------------- //
      const valueCanvas = valueCanvasRef.current
      if (!valueCanvas) return

      const valueCtx = valueCanvas.getContext('2d')
      if (!valueCtx) return

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
   const circlePosition = getCanvasPositionFromHueSaturation(phsv.h - 180, phsv.s / 100, CANVASSIZE / 2)

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
                  ref={hueSatCanvasRef}
                  width={CANVASSIZE}
                  height={CANVASSIZE}
                  style={{
                     borderRadius: '50%',
                     cursor: cushy.preferences.interface.value.useDefaultCursorEverywhere
                        ? 'default'
                        : 'pointer',
                  }}
                  onClick={(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
                     console.log('[FD] CLICKED')
                     const canvas = hueSatCanvasRef.current
                     if (!canvas) return

                     const rect = canvas.getBoundingClientRect()
                     const x = e.clientX - rect.left
                     const y = e.clientY - rect.top

                     const radius = canvas.width / 2
                     const centerX = radius
                     const centerY = radius

                     // Calculate relative position
                     const dx = x - centerX
                     const dy = y - centerY
                     const distance = Math.sqrt(dx * dx + dy * dy)

                     // Saturation is the distance from the center normalized to the radius
                     const saturation = Math.min(1, distance / radius)

                     // Hue is the angle from the center (in degrees, 0–360)
                     let hue = Math.atan2(dy, dx) * (180 / Math.PI)

                     // Adjust 90 degrees (Probably arbitrary, but I'm literally just copying how blender "looks", their code is probably cleaner cause they actually know math there LMAO)
                     hue = (hue - 90) % 360
                     if (hue < 0) hue += 360

                     const newCol = new Color('hsv', [hue, saturation * 100, phsv.v]).hsl

                     // const adjustedRgb = hslToRGB(hue, saturation, lightness / 100)
                     onColorChange(Kolor.fromString(`hsl(${newCol[0]}deg, ${newCol[1]}%, ${newCol[2]}%)`))

                     // onColorChange(`rgb(${r}, ${g}, ${b})`)
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
                     ref={valueCanvasRef}
                     width={BAR_CANVAS_WIDTH}
                     height={CANVASSIZE}
                     onClick={(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
                        const canvas = valueCanvasRef.current
                        if (!canvas) return

                        const rect = canvas.getBoundingClientRect()
                        const y = e.clientY - rect.top
                        const lightness = Math.round((1 - y / CANVASSIZE) * 100)

                        const newColor = new Color('hsv', [phsv.h, phsv.s, lightness])

                        const asHSL = newColor.hsl

                        onColorChange(Kolor.fromString(`hsl(${asHSL[0]}deg, ${asHSL[1]}%, ${asHSL[2]}%)`))
                     }}
                  />
               </Frame>
               <div
                  // Lightness indicator
                  tw='pointer-events-none absolute'
                  style={{
                     border: '1px solid black',
                     top: `${CANVASSIZE - (phsv.v / 100) * CANVASSIZE}px`,
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
                        background: `hsl(0deg, 0%, ${phsv.v}%)`,
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
                   console.log('[FD] Hue: ', val)
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
                   console.log('[FD] Saturation: ', val)
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
                   console.log('[FD] VALUE: ', val)
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
               console.log('[FD] HEX: ', value)
               const col = Kolor.fromString(value)
               const asSRGB = col.color.to('srgb')

               console.log('[FD] col: ', col)

               setTempHex(`#${formatHex(asSRGB.r)}${formatHex(asSRGB.g)}${formatHex(asSRGB.b)}`)

               onColorChange(col)
            }}
         />
      </Frame>
   )
})
