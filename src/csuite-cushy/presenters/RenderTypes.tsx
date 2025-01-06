import type { Field } from '../../csuite/model/Field'
import type { FieldSelector } from '../../csuite/selector/selector'
import type { CovariantFn1 } from '../../csuite/variance/BivariantHack'
import type { Presenter } from './Renderer'
import type { renderPresets } from './RenderPresets'
import type { DisplaySlots } from './RenderSlots'

// --------------------------------------------------------------------
// prettier-ignore
export type FieldUIConf<FIELD extends Field> =
   | RenderRule<FIELD>
   | DisplaySlots<FIELD> // RenderDSL<FIELD['$Child']['$Field']>

// display rule is just a function that returns a display slot, injecting the field
export type RenderRule<FIELD extends Field> = CovariantFn1<
   FieldUIConfCtx<FIELD>,
   DisplaySlots<FIELD> | undefined | void
>

export type FieldUIConfCtx<FIELD extends Field = Field> = {
   field: FIELD

   // see src/csuite-cushy/presenters/RenderXXX.ts for implementation
   set(x: DisplaySlots<FIELD>, priority?: number): void
   set<SUB extends Field = Field>(selector: string, x: DisplaySlotsExt<SUB>, priority?: number): void
   set<SUB extends Field = Field>(selector: FieldSelector, x: DisplaySlotsExt<SUB>, priority?: number): void
   set<SUB extends Field>(field: Maybe<SUB>, x: DisplaySlotsExt<SUB>, priority?: number): void

   presets: typeof renderPresets
}
// --------------------------------------------------------------------
// display rule is just a function that returns a display slot, injecting the field
// prettier-ignore
export type DisplaySlotsExt<FIELD extends Field> =
   | DisplaySlotsFn<FIELD>
   | DisplaySlots<FIELD>

export type DisplaySlotsFn<FIELD extends Field> = CovariantFn1<
   { field: FIELD },
   DisplaySlots<FIELD> | undefined | void
>

// --------------------------------------------------------------------

/**
 * this is the final type that is given to your most of your widgets (Shell, Body, ...)
 * it contains context things like `Presenter`, `field`, and `UI catalog`
 */
export interface CompiledRenderProps<out FIELD extends Field = Field>
/** full list of all slots when applying all the rules. */
   extends DisplaySlots<FIELD> {
   /** presenter */
   presenter: Presenter

   /** Field we're currently rendering */
   field: FIELD

   /** catalog of widgets, to ease discoverability and make it easy to use variants. */
   UI: CATALOG.widgets
}
