import type { CushySchema } from '../controls/CushySchema'
import type { DisplaySlotFn } from '../csuite-cushy/presenters/RenderTypes'
import type { Field } from '../csuite/model/Field'
import type { SchemaDict } from '../csuite/model/SchemaDict'
import type { MediaImageL } from '../models/MediaImage'
import type { UnifiedCanvas } from '../panels/PanelCanvas/states/UnifiedCanvas'
import type { Runtime } from '../runtime/Runtime'
import type { AppMetadata } from './AppManifest'
import type { CSSProperties, ReactNode } from 'react'

// export const action = <const F extends WidgetDict>(name: string, t: Omit<Action<F>, 'name'>): Action<F> => ({ name, ...t })
/* 🛋️ */ export type GlobalFunctionToDefineAnApp = <const FIELD extends Field>(t: App<FIELD>) => AppRef<FIELD>
/* 🛋️ */ export type GlobalFunctionToDefineAView = <const P extends { [key: string]: any }>(
   t: CustomView<P>,
) => CustomViewRef<P>
/* 🛋️ */ export type GlobalGetCurrentRun = () => Runtime

/* shared */ export type GlobalGetCurrentForm = () => X.Builder

/* ⏰ */ export type ActionTagMethod = (arg0: string) => string
/* ⏰ */ export type ActionTagMethodList = Array<{ key: string; method: ActionTagMethod }>

export type ActionTags = (arg0: ActionTagMethodList) => void

export type AppRef<FIELDS> = {
   /** this is a virtual property; only here so app refs can carry the type-level form information. */
   $FIELDS: FIELDS
   /** app ID */
   id: CushyAppID
}

export type CustomViewRef<PARAMS> = {
   /** this is a virtual property; only here so view refs can carry the type-level view params. */
   $PARAMS: PARAMS
   /** app ID */
   id: CushyViewID
}

export type $ExtractFormValueType<FIELDS extends SchemaDict> = { [k in keyof FIELDS]: FIELDS[k]['$Value'] }

export type CustomView<T = any> = {
   preview: (t: T) => ReactNode
   render: (t: T) => ReactNode
}

export type DraftExecutionContext = {
   image?: Maybe<MediaImageL>
   mask?: Maybe<MediaImageL>
   canvas?: Maybe<UnifiedCanvas>
}

export type App<FIELD extends Field> = {
   /** app interface (GUI) */
   ui: (form: X.Builder) => CushySchema<FIELD>

   /* layout */
   layout?: Maybe<DisplaySlotFn<NoInfer<FIELD>>>

   /** so you cana have fancy buttons to switch between a few things */
   presets?: Record<string, (doc: NoInfer<FIELD>) => void>

   /** app execution logic */
   run: (
      //
      runtime: Runtime<NoInfer<FIELD>>,
      formResult: NoInfer<FIELD>['$Value'],
      context: DraftExecutionContext,
   ) => void | Promise<void>

   /** if set to true, will register drafts to quick action in image context menu */
   canStartFromImage?: boolean

   /** the list of dependencies user can specify */
   metadata?: AppMetadata

   /** form container className */
   containerClassName?: string

   containerStyle?: CSSProperties

   // HELP ============================================================
   /** dependencies of your action */
   customNodeRequired?: string[]
   /** help text to show user when using their card */
   help?: string

   /** Will be used for compatability handling
    *  Anything that changes an api path or would break "extensions" should (usually) increment the major version
    */
   version?: { major: number; minor: number; patch: number }
}
