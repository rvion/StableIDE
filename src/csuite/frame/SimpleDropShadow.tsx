import type { CushySchemaBuilder } from '../../controls/CushyBuilder'
import type { TintExt } from '../kolor/Tint'

export type SimpleDropShadow = {
   x?: number
   y?: number
   blur?: number
   color?: TintExt
   opacity?: number
}

export type $schemaSimpleDropShadow = X.XGroup<{
   x: X.XNumber
   y: X.XNumber
   blur: X.XNumber
   color: X.XColor
   opacity: X.XNumber
}>

export function run_theme_dropShadow(shadow: SimpleDropShadow): string {
   if (shadow.opacity == 0) {
      return 'unset'
   }

   return `${shadow.x ?? 0}px ${shadow.y ?? 0}px ${shadow.blur ?? 0}px ${shadow.color ?? '#000000'}${Math.round((shadow.opacity ?? 0.2) * 255).toString(16)}`
}

export const schemaSimpleDropShadow = (ui: CushySchemaBuilder): $schemaSimpleDropShadow =>
   ui.fields({
      x: ui.int({ default: 0, min: -20, max: 20 }),
      y: ui.int({ default: 1, min: -20, max: 20 }),
      color: ui.colorV2({ default: '#000', tooltip: 'Drop shadow color for inputs' }),
      blur: ui.int({ default: 0, min: 0, max: 20 }),
      opacity: ui.float({ default: 0.5, min: 0, max: 1, step: 0.1 }),
   })
