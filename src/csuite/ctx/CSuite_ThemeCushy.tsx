import type { FormGlobalLayoutMode } from '../../state/conf/FormGlobalLayoutMode'
import type { STATE } from '../../state/state'
import type { Tint, TintExt } from '../kolor/Tint'
import type { CSuiteConfig } from './CSuiteConfig'

import { makeAutoObservable } from 'mobx'

import { Kolor } from '../kolor/Kolor'
import { run_tint } from '../kolor/prefab_Tint'

export class CSuite_ThemeCushy implements CSuiteConfig {
   constructor(private st: STATE) {
      makeAutoObservable(this)
   }

   showExpandCarets: boolean = true
   showSelectIcons: boolean = false

   get tooltipDelay(): Maybe<number> {
      return cushy.preferences.interface.TooltipDelay.value
   }

   get showFoldButtons(): boolean {
      return this.st.preferences.interface.Widget.ShowFoldButtons.value ?? true
   }

   // sizes ------------------------------------------------------
   get widgetHeight(): number {
      return this.st.preferences.interface.WidgetHeight.value ?? 1.8
   }

   get inputHeight(): number {
      return this.st.preferences.interface.InputHeight.value ?? 1.6
   }

   get insideHeight(): number {
      return this.st.preferences.interface.InsideHeight.value ?? 1.2
   }

   get inputRoundness(): number {
      return this.st.preferences.theme.value.global.roundness ?? 5
   }

   // misc ------------------------------------------------------
   get clickAndSlideMultiplicator(): number {
      return this.st.clickAndSlideMultiplicator ?? 1
   }

   get showWidgetUndo(): boolean {
      return this.st.preferences.interface.Widget.ShowUndo.value ?? true
   }

   get showWidgetMenu(): boolean {
      return this.st.preferences.interface.Widget.ShowMenu.value ?? true
   }

   get showWidgetDiff(): boolean {
      return this.st.preferences.interface.Widget.ShowDiff.value ?? true
   }

   get showToggleButtonBox(): boolean {
      return this.st.preferences.interface.Widget.ShowToggleButtonBox.value ?? false
   }

   get labellayout(): FormGlobalLayoutMode {
      const x = this.st.preferences.theme.LabelLayout.value
      if (x === 'fluid') return 'fluid'
      if (x === 'fixed-left') return 'fixed-left'
      if (x === 'fixed-right') return 'fixed-right'
      if (x === 'mobile') return 'mobile'
      return 'fixed-right'
   }

   showWidgetExtra: boolean = true
   truncateLabels?: boolean | undefined = false

   // theme

   get baseStr(): string {
      return this.st.preferences.theme.Base.value
   }

   get base(): Kolor {
      return Kolor.fromString(this.baseStr)
   }

   get shiftDirection(): 1 | -1 {
      return this.base.lightness > 0.5 ? -1 : 1
   }

   labelBackground: TintExt = 0 // 3 // {}

   get text(): Tint {
      return run_tint(this.st.preferences.theme.value.global.text.base)
   }

   get inputContrast(): TintExt {
      return this.st.preferences.theme.value.global.contrast
   }

   get inputBorder(): TintExt {
      return this.st.preferences.theme.value.global.border ?? 10
   }

   get labelText(): Tint | undefined {
      const raw = this.st.preferences.theme.value.global.labelText.base
      if (raw == null) return undefined
      return run_tint(raw)
   }

   get fieldGroups(): {
      border: Maybe<number>
      contrast: Maybe<number>
   } {
      return {
         border: this.st.preferences.theme.FieldGroups.value?.border,
         contrast: this.st.preferences.theme.FieldGroups.value?.contrast,
      }
   }
}
