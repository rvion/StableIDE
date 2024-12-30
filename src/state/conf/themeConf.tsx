import type { SelectOptionNoVal } from '../../csuite/fields/selectOne/SelectOption'
import type { FormGlobalLayoutMode } from './FormGlobalLayoutMode'

import { cushyFactory } from '../../controls/CushyBuilder'
import { WidgetSelectOne_TabUI } from '../../csuite/fields/selectOne/WidgetSelectOne_TabUI'
import { type $schemaSimpleDropShadow, schemaSimpleDropShadow } from '../../csuite/frame/SimpleDropShadow'
import { ui_theme_text, type UI_Theme_Text } from '../../csuite/kolor/prefab_Text'
import { ui_tint, type UI_Tint } from '../../csuite/kolor/prefab_Tint'
import { readJSON, writeJSON } from '../jsonUtils'

// --------------
export type ThemeConf = X.XGroup<{
   labelLayout: X.XSelectOne_<FormGlobalLayoutMode>
   base: X.XColor
   appbar: X.XOptional<X.XColor>
   /** @deprecated Legacy option, will probably be removed? */
   fieldGroups: X.XGroup<{
      border: X.XOptional<X.XNumber>
      contrast: X.XOptional<X.XNumber>
   }>
   global: X.XGroup<{
      border: X.XOptional<X.XNumber>
      contrast: X.XOptional<X.XNumber>
      shadow: X.XOptional<$schemaSimpleDropShadow>
      text: UI_Theme_Text
      // TODO(bird_d/theme/text): Not plugged in yet
      textLabel: UI_Theme_Text
      roundness: X.XNumber
      active: UI_Tint
   }>

   groups: X.XGroup<{
      border: X.XOptional<X.XNumber>
      contrast: X.XOptional<X.XNumber>
      padding: X.XNumber
   }>
}>

export const themeConf: ThemeConf['$Field'] = cushyFactory.document(
   (ui) =>
      ui.fields(
         {
            labelLayout: ui.selectOneOptionId<SelectOptionNoVal<FormGlobalLayoutMode>>(
               [
                  { id: 'fixed-left', /*  */ icon: 'mdiAlignHorizontalLeft' /*  */, label: '' },
                  { id: 'fixed-right', /* */ icon: 'mdiAlignHorizontalRight' /* */, label: '' },
                  { id: 'fluid', /*       */ icon: 'mdiFullscreenExit' /*       */, label: '' },
                  { id: 'mobile', /*      */ icon: 'mdiCellphone' /*            */, label: '' },
               ],
               {
                  header: (p) => <WidgetSelectOne_TabUI field={p.field} tw='!gap-0 ![flex-wrap:nowrap]' />,
                  default: 'fixed-left',
               },
            ),
            // 1. colors
            base: ui.colorV2({
               tooltip: 'main color of the CushyStudio UI',
               default: '#F4F5FB',
               // presets: [
               //     { label: 'Dark', icon: 'mdiLightSwitch', apply: (w) => (w.value = '#1E212B') },
               //     { label: 'Light', icon: 'mdiLightSwitch', apply: (w) => (w.value = '#F4F5FB') },
               //     { label: 'Moonlight', icon: 'mdiMoonFull', apply: (w) => (w.value = 'oklch(32.1% 0.01 268.4)') },
               // ],
            }),
            appbar: ui
               .colorV2({
                  tooltip: 'color or the app shell (appbar, footer, tabset separator, etc.)',
                  default: '#313338',
               })
               .optional(false),

            // ...
            // gap: ui.float({ default: 0.5, min: 0, max: 2 }).optional(),
            // widgetWithLabel: ui.fields(
            //     {
            //         border: ui.percent({ default: 8 }).optional(),
            //         contrast: ui.percent({ default: 0.824, min: 0, softMax: 10, max: 100 }).optional(),
            //         padding: ui.float({ default: 0.5, min: 0, max: 2 }).optional(),
            //     },
            //     { background: { hueShift: 90 } },
            // ),
            // fields group
            fieldGroups: ui.fields(
               {
                  border: ui.percent({ default: 20 }).optional(false),
                  contrast: ui.percent({ default: 0.824, min: 0, softMax: 10, max: 100 }).optional(false),
                  // padding: ui.float({ default: 0.5, min: 0, max: 2 }).optional(),
               },
               { background: { hue: 180 } },
            ),

            global: ui.fields({
               border: ui.percent({ default: 5, min: -100, max: 100 }).optional(true),
               contrast: ui.percent({ default: -10, min: -100, max: 100 }).optional(true),
               shadow: schemaSimpleDropShadow(ui).optional(true),
               roundness: ui.int({ default: 5, min: 0 }),
               active: ui_tint(ui, { contrast: 0.25, chromaBlend: 7.5 }),
               text: ui_theme_text(ui),
               labelText: ui_theme_text(ui),
            }),

            groups: ui.fields({
               border: ui.percent({ default: 20, min: -100, max: 100 }).optional(false),
               contrast: ui.percent({ default: 11, min: -100, max: 100 }).optional(true),
               padding: ui.number({ default: 0.5, min: 0, max: 20, step: 1, suffix: 'rem' }),
            }),
         },
         {
            label: 'Theme',
            collapsed: false,
         },
      ),
   {
      name: 'theme config',
      serial: () => readJSON('settings/theme2.json'),
      onSerialChange: (form) => writeJSON('settings/theme2.json', form.serial),
   },
)
