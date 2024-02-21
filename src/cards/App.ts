import type { CSSProperties } from 'react'
import type { FormBuilder } from 'src/controls/FormBuilder'
import type { Runtime } from 'src/runtime/Runtime'
import type { Widget } from '../controls/Widget'
import type { AppMetadata } from './AppManifest'
import type { MediaImageL } from 'src/models/MediaImage'
import type { CProperty } from 'src/controls/Prop'

// ACTIONS ============================================================
// 1. the main abstraction of cushy are actions.
/** quick function to help build actions in a type-safe way */

// export const action = <const F extends WidgetDict>(name: string, t: Omit<Action<F>, 'name'>): Action<F> => ({ name, ...t })
export type GlobalFunctionToDefineAnApp = <const F extends WidgetDict>(t: App<F>) => AppRef<F>
export type GlobalGetCurrentRun = () => Runtime
export type GlobalGetCurrentForm = () => FormBuilder
export type ActionTagMethod = (arg0: string) => string
export type ActionTagMethodList = Array<{ key: string; method: ActionTagMethod }>
export type ActionTags = (arg0: ActionTagMethodList) => void
// export type WidgetDict = { [key: string]: Widget }
export type WidgetDict = { [key: string]: CProperty }
export type AppRef<F> = { $Output: F; id: CushyAppID }

export type $ExtractFormValueType<FIELDS extends WidgetDict> = { [k in keyof FIELDS]: FIELDS[k]['$Output'] }

export type App<FIELDS extends WidgetDict> = {
    /** app interface (GUI) */
    ui: (form: FormBuilder) => FIELDS

    /** app execution logic */
    run: (
        //
        runtime: Runtime<FIELDS>,
        formResult: { [k in keyof FIELDS]: FIELDS[k]['$Output'] },
        starImage?: Maybe<MediaImageL>,
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
}
