import type { Field_number_config_configured } from '../model/builders/BuilderNumberTypes'
import type { Tint } from './Tint'

import { type $schemaSimpleDropShadow, schemaSimpleDropShadow } from '../frame/SimpleDropShadow'
import { ui_tint, type UI_Tint } from './prefab_Tint'

export type UI_Theme_Text = X.XGroup<{
   base: UI_Tint
   size: X.XNumber
   shadow: $schemaSimpleDropShadow
}>

export const ui_theme_text = (
   ui: X.Builder,
   def?: { base?: Tint; size?: Field_number_config_configured },
): UI_Theme_Text => {
   return ui.fields({
      base: ui_tint(ui, def && def.base ? def.base : { lightness: 0.9, chroma: 0.04 }),
      size: ui.float(def && def.size ? def.size : { default: 11, min: 8, max: 20, step: 1, suffix: 'pt' }),
      shadow: schemaSimpleDropShadow(ui),
   })
}
