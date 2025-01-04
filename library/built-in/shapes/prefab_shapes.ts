/**
 * Standalone prefab to generate cool starting latents based on random geometrics shapes
 *
 * that file exports 3 things
 *  1. the UI that define the controls to generate the shapres
 *  2. the run function that generate the shapes from the UI config
 *  3. the main helper funtion that print stuff on canvas
 */

import type { Field_number } from '../../../src/csuite/fields/number/FieldNumber'
import type Konva from 'konva'

// --------------------------------------------------------------------------------
// what we're going to build a latent from
export type ShapeType = 'circle' | 'polygon' | 'rect' | 'star' | 'ring' | 'rainbowRing'
export interface Shape {
   type: ShapeType
   amount: number
}

// --------------------------------------------------------------------------------
// This type doesn't need to be written, but writing it helps a bit
// cause typescript will check code faster, and be slightly more helpful
// so it's a good practice once code is getting stabler to write types
// for all:
//  - exported stuff
//  - class properties
//  - function return types
// even when typescript does a great job at inferring them :)
// will make your vscode go brrrrr.

export type UI_LatentShapeGenerator = X.XGroup<{
   batchSize: X.XShared<X.Number> | X.XNumber
   size: X.XShared<X.Size> | X.XSize
   amountCircle: X.XNumber
   amountRect: X.XNumber
   amountStar: X.XNumber
   amountPolygon: X.XNumber
   amountRing: X.XNumber
   amountRainbow: X.XNumber
   color1: X.XString
   color2: X.XString
   colorVariationFactor: X.XNumber
}>

// 1. ------------------------------------------------------------------------------------
export function ui_LatentShapeGenerator(
   //
   batchSize?: X.XShared<X.Number>,
   size?: X.XShared<X.Size>,
): UI_LatentShapeGenerator {
   const ui = getCurrentForm()
   return ui.fields(
      {
         batchSize: batchSize ?? ui.int({ step: 1, default: 1, min: 1, max: 15 }),
         size: size ?? ui.size({ default: { modelType: 'SDXL 1024' }, step: 8 }), // prettier-ignore
         amountCircle: ui.int({ step: 1, default: 0, min: 0, softMax: 15 }),
         amountRect: ui.int({ step: 1, default: 0, min: 0, softMax: 15 }),
         amountStar: ui.int({ step: 1, default: 0, min: 0, softMax: 15 }),
         amountPolygon: ui.int({ step: 1, default: 0, min: 0, softMax: 15 }),
         amountRing: ui.int({ step: 1, default: 0, min: 0, softMax: 15 }),
         amountRainbow: ui.int({ step: 1, default: 0, min: 0, softMax: 15 }),

         color1: ui.stringColor({ default: '#FFFFFF' }),
         color2: ui.stringColor({ default: '#000000' }),
         colorVariationFactor: ui.float({ min: 0, max: 1, default: 0.5, description: 'A higher color variation factor value will result in more color variation, while a lower color variation factor value will result in less color variation. If factor is 0, there will be no color variation at all.' }), // prettier-ignore
      },
      {
         collapsed: false,
         presets: [
            {
               label: 'default',
               apply: (widget): void => {
                  widget.setPartialValue({
                     amountCircle: 0,
                     amountRect: 0,
                     amountStar: 0,
                     amountPolygon: 0,
                     amountRing: 0,
                     amountRainbow: 0,
                     color1: '#FFFFFF',
                     color2: '#000000',
                     colorVariationFactor: 0.5,
                  })
               },
            },
            {
               label: 'pinkPower',
               apply: (widget): void => {
                  widget.setPartialValue({
                     amountCircle: 1,
                     amountRect: 1,
                     amountStar: 1,
                     amountPolygon: 1,
                     amountRing: 1,
                     amountRainbow: 1,
                     color1: '#FFC0CB',
                     color2: '#AA336A',
                     colorVariationFactor: 0,
                  })
               },
            },
            {
               label: 'itHurtsMyEyes',
               apply: (widget): void => {
                  widget.setPartialValue({
                     amountCircle: 10,
                     amountRect: 10,
                     amountStar: 10,
                     amountPolygon: 2,
                     amountRing: 2,
                     amountRainbow: 1,
                     color1: '#ffffff',
                     color2: '#000000',
                     colorVariationFactor: 1,
                  })
               },
            },
         ],
      },
   )
}

// 2. ------------------------------------------------------------------------------------
/** this function returns a fancy latent */
export const run_LatentShapeGenerator = async (
   /** the shape generation config */
   shapeConfig: UI_LatentShapeGenerator['$Value'],
   /** required to convert generated image to latent */
   vae: Comfy.Signal['VAE'],
): Promise<{
   width: number
   height: number
   latent: Comfy.Signal['LATENT']
}> => {
   const run = getCurrentRun()
   const graph = run.nodes

   const width = shapeConfig.size.width
   const height = shapeConfig.size.height
   const { Konva, Images } = run
   const layer = Konva.createStageWithLayer({ width, height })
   const color1 = shapeConfig.color1
   const color2 = shapeConfig.color2
   const factor = shapeConfig.colorVariationFactor

   // Add random shapes with different sizes and gradients
   const startPoint = Math.random() < 0.5 ? { x: 0, y: 0 } : { x: width, y: 0 }
   const endPoint = Math.random() < 0.5 ? { x: 0, y: height } : { x: width, y: height }

   // add background gradient
   const shape = new Konva.Konva.Rect({
      x: 0,
      y: 0,
      width,
      height,
      fillLinearGradientStartPoint: startPoint,
      fillLinearGradientEndPoint: endPoint,
      fillLinearGradientColorStops: [
         0,
         newColor(color1, color2, factor),
         1,
         newColor(color1, color2, factor),
      ],
   })

   shape.filters([Konva.Konva.Filters.Noise])
   shape.noise(0.7) // Adjust this value to control the amount of noise
   layer.add(shape)

   // Convert the user's colors to RGB

   _addShapesToLayer('rect', shapeConfig.amountRect, layer, width, height, color1, color2, factor)
   _addShapesToLayer('circle', shapeConfig.amountCircle, layer, width, height, color1, color2, factor)
   _addShapesToLayer('star', shapeConfig.amountStar, layer, width, height, color1, color2, factor)
   _addShapesToLayer('polygon', shapeConfig.amountPolygon, layer, width, height, color1, color2, factor)
   _addShapesToLayer('ring', shapeConfig.amountRing, layer, width, height, color1, color2, factor)
   _addShapesToLayer('rainbowRing', shapeConfig.amountRainbow, layer, width, height, color1, color2, factor)

   const shapes: Shape[] = [
      { type: 'rect', amount: shapeConfig.amountRect },
      { type: 'circle', amount: shapeConfig.amountCircle },
      { type: 'star', amount: shapeConfig.amountStar },
      { type: 'polygon', amount: shapeConfig.amountPolygon },
      { type: 'ring', amount: shapeConfig.amountRing },
      { type: 'rainbowRing', amount: shapeConfig.amountRainbow },
   ]

   // Shuffle the array
   for (let i = shapes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      ;[shapes[i]!, shapes[j]!] = [shapes[j]!, shapes[i]!]
   }

   // Add shapes to the layer in the shuffled order
   for (const shape of shapes) {
      _addShapesToLayer(
         //
         shape.type,
         shape.amount,
         layer,
         width,
         height,
         color1,
         color2,
         factor,
      )
   }

   const b64 = Konva.convertLayerToDataURL(layer)
   const img = Images.createFromDataURL(b64)
   img.addTag('noise')
   img.addTag('latent-shape-generator')

   let latent: Comfy.Signal['LATENT'] = graph.VAEEncode({
      pixels: await run.loadImageAnswer(img),
      vae: vae,
   })

   // if batch size is greater than 1, repeat the latent batch
   if (shapeConfig.batchSize > 1) {
      latent = graph.RepeatLatentBatch({
         samples: latent,
         amount: shapeConfig.batchSize,
      })
   }

   return { latent, width, height }
}

// 3. ------------------------------------------------------------------------------------
function _addShapesToLayer(
   shapeType: ShapeType,
   shapeCount: number,
   layer: Konva.Layer,
   width: number,
   height: number,
   color1: string,
   color2: string,
   factor: number,
): void {
   const Konva = getCurrentRun().Konva.Konva

   const shapeCreators: {
      [shape in ShapeType]: (
         x: number,
         y: number,
         colors: string[],
         shapeWidth: number,
         shapeHeight: number,
         startPoint: { x: number; y: number },
         endPoint: { x: number; y: number },
      ) => Konva.Shape
   } = {
      rect: (
         x: number,
         y: number,
         colors: any[],
         shapeWidth: number,
         shapeHeight: number,
         startPoint: any,
         endPoint: any,
      ) =>
         new Konva.Rect({
            x,
            y,
            width: shapeWidth,
            height: shapeHeight,
            fillLinearGradientStartPoint: startPoint,
            fillLinearGradientEndPoint: endPoint,
            fillLinearGradientColorStops: colors,
            opacity: Math.random(),
         }),
      circle: (x: number, y: number, colors: any[], radius: number) =>
         new Konva.Circle({
            x,
            y,
            radius,
            fillRadialGradientStartPoint: { x: 0, y: 0 },
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: { x: 0, y: 0 },
            fillRadialGradientEndRadius: radius,
            fillRadialGradientColorStops: colors,
            opacity: Math.random(),
         }),
      star: (x: number, y: number, colors: any[], innerRadius: number, outerRadius: number) =>
         new Konva.Star({
            x,
            y,
            numPoints: Math.floor(Math.random() * 5) + 5,
            rotationDeg: Math.floor(Math.random() * 360) + 0,
            innerRadius,
            outerRadius,
            fillRadialGradientStartPoint: { x: 0, y: 0 },
            fillRadialGradientStartRadius: innerRadius,
            fillRadialGradientEndPoint: { x: 0, y: 0 },
            fillRadialGradientEndRadius: outerRadius,
            fillRadialGradientColorStops: colors,
            opacity: Math.random(),
         }),
      polygon: (x: number, y: number, colors: string[], radius: number) =>
         new Konva.RegularPolygon({
            x,
            y,
            sides: Math.floor(Math.random() * 10) + 1,
            radius,
            fillRadialGradientStartPoint: { x: 0, y: 0 },
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: { x: 0, y: 0 },
            fillRadialGradientEndRadius: radius,
            fillRadialGradientColorStops: colors,
            opacity: Math.random(),
         }),
      ring: (x: number, y: number, colors: string[], innerRadius: number, outerRadius: number) =>
         new Konva.Ring({
            x,
            y,
            sides: Math.floor(Math.random() * 10) + 1,
            innerRadius,
            outerRadius,
            fillRadialGradientStartPoint: { x: 0, y: 0 },
            fillRadialGradientStartRadius: innerRadius,
            fillRadialGradientEndPoint: { x: 0, y: 0 },
            fillRadialGradientEndRadius: outerRadius,
            fillRadialGradientColorStops: colors,
            opacity: Math.random(),
         }),
      rainbowRing: (x: number, y: number, colorStops: string[], innerRadius: number, outerRadius: number) =>
         new Konva.Shape({
            sceneFunc: function (context): void {
               const minRadius = 50 // Set to desired minimum radius
               innerRadius = Math.max(innerRadius, minRadius / 2)
               outerRadius = Math.max(outerRadius, minRadius)

               const step: number = Math.floor(Math.random() * 9) + 2
               const colorStopsGenerated = generateColor(step, color1, color2, factor, false)
               const arcLength = (2 * Math.PI) / (colorStopsGenerated.length - 1)
               const lineWidth = outerRadius - innerRadius

               for (const [i, colorStop] of colorStopsGenerated.entries()) {
                  context.beginPath()
                  context.arc(x, y, outerRadius, i * arcLength, (i + 1) * arcLength)
                  context.strokeStyle = colorStop!
                  context.lineWidth = lineWidth
                  context.stroke()
               }
            },
         }),
   }
   for (let i = 0; i < shapeCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const shapeWidth = (Math.random() * 0.3 + 0.1) * width
      const shapeHeight = (Math.random() * 0.3 + 0.1) * height
      const startPoint = { x: 0, y: 0 }
      const endPoint = { x: shapeWidth, y: shapeHeight }

      const max: number = 3
      const step: number = Math.floor(Math.random() * max - 1) + 2
      const colors = generateColorStops(step, color1, color2, factor)

      const shape = shapeCreators[shapeType](x, y, colors, shapeWidth, shapeHeight, startPoint, endPoint)

      shape.filters([Konva.Filters.Noise, Konva.Filters.Blur])
      shape.blurRadius(Math.random() * 10)
      shape.noise(Math.random()) // Adjust this value to control the amount of noise

      layer.add(shape)
   }
}

export function newColor(
   color1: string,
   color2: string,
   colorVariationFactor: number = 0.1,
   opacity: boolean = false,
): string {
   const unique = true // Set to true for unique random numbers, false for a single random number
   const uniqueNumber = Math.random()

   let randomNumbers = []

   if (unique) {
      for (let i = 0; i < 3; i++) {
         let number = uniqueNumber + (Math.random() < 0.5 ? -1 : 1) * colorVariationFactor
         number = Math.max(0, Math.min(1, number)) // Ensure number is within [0, 1]
         randomNumbers.push(number)
      }
   } else {
      randomNumbers = [uniqueNumber, uniqueNumber, uniqueNumber]
   }

   const color1Rgb = hexToRgb(color1)
   const color2Rgb = hexToRgb(color2)
   const interpolatedColor = interpolateColor(color1Rgb, color2Rgb, randomNumbers)
   const rgbColor = rgbToHex(interpolatedColor)

   if (opacity) {
      // Add opacity...
      const minCeiled = Math.ceil(-8)
      const maxFloored = Math.floor(8)
      const number = Math.max(
         0,
         Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled),
      ).toString(16)
      const rgbaColor = `${rgbColor}${number}${number}` //
      return rgbaColor
   } else {
      const rgbaColor = `${rgbColor}FF`
      return rgbaColor
   }
}

function generateColor(
   stops: number,
   color1: string,
   color2: string,
   factor: number,
   opacity: boolean = true,
): string[] {
   const colorStops = []
   for (let i = 1; i < stops; i++) {
      colorStops.push(newColor(color1, color2, factor))
   }
   if (opacity) {
      colorStops.push(newColor(color1, color2, factor, true))
   } else {
      colorStops.push(newColor(color1, color2, factor))
   }
   return colorStops
}

function generateColorStops(stops: number, color1: string, color2: string, factor: number): any[] {
   const colors: string[] = generateColor(stops, color1, color2, factor)
   const colorStops = []
   for (let i = 0; i <= stops; i++) {
      const t = i / stops
      if (colors[i] !== undefined) {
         colorStops.push(t, colors[i])
      }
   }

   return colorStops
}

/** Interpolates between two colors based on a factor for each color channel */
function interpolateColor(
   //
   color1: number[],
   color2: number[],
   factor: number[],
): number[] {
   return color1.map((channel, i) => Math.round(channel + factor[i]! * (color2[i]! - channel)))
}

/** Converts an RGB color to a hexadecimal color */
function rgbToHex(rgb: number[]): string {
   return '#' + rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('')
}

/** Converts a hexadecimal color to an RGB color */
function hexToRgb(hex: string): number[] {
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
   return result ? result.slice(1, 4).map((channel) => parseInt(channel, 16)) : []
}
