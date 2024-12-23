import type { DraftExecutionContext } from '../cards/App'
import type { Field_group } from '../csuite/fields/group/FieldGroup'
import type { LiveDB } from '../db/LiveDB'
import type { TABLES } from '../db/TYPES.gen'
import type { RuntimeExecutionResult } from '../runtime/Runtime'
import type { StepOutput } from '../types/StepOutput'
import type { ComfyPromptL } from './ComfyPrompt'
import type { ComfyWorkflowL } from './ComfyWorkflow'
import type { CushyAppL } from './CushyApp'
import type { DraftL } from './Draft'
import type { Executable } from './Executable'
import type { MediaSplatL } from './MediaSplat'

import { Status } from '../back/Status'
import { SQLITE_false, SQLITE_true } from '../csuite/types/SQLITE_boolean'
import { ManualPromise } from '../csuite/utils/ManualPromise'
import { BaseInst } from '../db/BaseInst'
import { LiveRef } from '../db/LiveRef'
import { LiveRefOpt } from '../db/LiveRefOpt'
import { LiveTable } from '../db/LiveTable'
import { Runtime } from '../runtime/Runtime'
import { getGlobalRuntimeCtx } from './getGlobalRuntimeCtx'
import { Media3dDisplacementL } from './Media3dDisplacement'
import { MediaCustomL } from './MediaCustom'
import { MediaImageL } from './MediaImage'
import { MediaTextL } from './MediaText'
import { MediaVideoL } from './MediaVideo'
import { RuntimeErrorL } from './RuntimeError'

export type FormPath = (string | number)[]

export class StepRepo extends LiveTable<TABLES['step'], typeof StepL> {
   constructor(liveDB: LiveDB) {
      super(liveDB, 'step', '🚶‍♂️', StepL)
      this.init()
   }
}

/** a thin wrapper around an app execution */
export class StepL extends BaseInst<TABLES['step']> {
   instObservabilityConfig: undefined
   dataObservabilityConfig: undefined

   draftL = new LiveRefOpt<StepL, DraftL>(this, 'draftID', 'draft')
   get draft(): Maybe<DraftL> {
      return this.draftL.item
   }

   abort(): void {
      this.update({ status: Status.Failure })
      // TODO: finish me
   }

   finished = new ManualPromise<RuntimeExecutionResult>()
   start = async (p: {
      /**
       * reference to the draft live form instance
       * this will be made available to the runtime so the runtime can access
       * the live form
       * */
      formInstance: Field_group<any> // Field_group<any>
      context: DraftExecutionContext
   }): Promise<void> => {
      // ensure we have an executable
      const executable = this.executable
      if (executable == null) return console.log('🔴 no executable found for this app')

      // instanciate the runtime
      const runtime = new Runtime(this)
      this.runtime = runtime

      // mark as running
      this.update({ status: Status.Running })

      // allocate a new async store so any async prefab can still retrieve its intance globally
      // (avoid drilling props)
      // | 🔶 TODO: ensure memory is freed after execution
      // | 🔶 doc here: https://nodejs.org/api/async_context.html#asynchronous-context-tracking
      const asyncRuntimeStorage = getGlobalRuntimeCtx()
      const scriptExecutionStatus: RuntimeExecutionResult = await asyncRuntimeStorage.run(
         { runtime, stepID: this.id },
         async () => runtime._EXECUTE(p),
      )

      // const scriptExecutionStatus: RuntimeExecutionResult = await this.runtime._EXECUTE(p)

      if (scriptExecutionStatus.type === 'error') {
         this.update({ status: Status.Failure })
      } else {
         if (this.comfy_prompts.every((p: ComfyPromptL) => p.data.executed)) {
            this.update({ status: Status.Success })
         }
      }
      this.finished.resolve(scriptExecutionStatus)
   }

   get finalStatus(): Status {
      if (this.status !== Status.Success) return this.status
      return this.comfy_prompts.every((p: ComfyPromptL) => p.data.executed) //
         ? Status.Success
         : Status.Running
   }

   appL = new LiveRef<this, CushyAppL>(this, 'appID', 'cushy_app')

   get app(): CushyAppL {
      return this.appL.item
   }

   get status(): Status {
      return this.data.status as Status
   }

   get executable(): Maybe<Executable> {
      return this.app.executable_orExtract
   }

   get name(): string {
      return this.data.name ?? this.app.name
   }

   get lastImageOutput(): Maybe<MediaImageL> {
      return this.images[this.images.length - 1]
   }

   get generatedImages(): MediaImageL[] {
      return this.images
   }

   outputWorkflow = new LiveRef<this, ComfyWorkflowL>(this, 'outputGraphID', 'comfy_workflow')

   get texts(): MediaTextL[] {
      return this.db.media_text.select((q) => q.where('stepID', '=', this.id), ['media_text.stepID'])
   }

   get images(): MediaImageL[] {
      return this.db.media_image.select((q) => q.where('stepID', '=', this.id), ['media_image.stepID'])
   }

   get videos(): MediaVideoL[] {
      return this.db.media_video.select((q) => q.where('stepID', '=', this.id), ['media_video.stepID'])
   }

   get displacements(): Media3dDisplacementL[] {
      return this.db.media_3d_displacement.select(
         (q) => q.where('stepID', '=', this.id),
         ['media_3d_displacement.stepID'],
      )
   }

   get customOutputs(): MediaCustomL[] {
      return this.db.media_custom.select((q) => q.where('stepID', '=', this.id), ['media_custom.stepID'])
   }

   get splats(): MediaSplatL[] {
      return this.db.media_splat.select((q) => q.where('stepID', '=', this.id), ['media_splat.stepID'])
   }

   get comfy_workflows(): ComfyWorkflowL[] {
      return this.db.comfy_workflow.select((q) => q.where('stepID', '=', this.id), ['comfy_workflow.stepID'])
   }

   get comfy_prompts(): ComfyPromptL[] {
      return this.db.comfy_prompt.select((q) => q.where('stepID', '=', this.id), ['comfy_prompt.stepID'])
   }

   get runtimeErrors(): RuntimeErrorL[] {
      return this.db.runtime_error.select((q) => q.where('stepID', '=', this.id), ['runtime_error.stepID'])
   }

   // private _CACHE_INVARIANT = null // () => this.data.status !== Status.Running
   // = new LiveCollection<TABLES['media_text']>           ({table: () => this.db.media_text,           where: () => ({stepID:this.id}), cache: this._CACHE_INVARIANT}) // prettier-ignore
   // = new LiveCollection<TABLES['media_image']>          ({table: () => this.db.media_image,          where: () => ({stepID:this.id}), cache: this._CACHE_INVARIANT}) // prettier-ignore
   // = new LiveCollection<TABLES['media_video']>          ({table: () => this.db.media_video,          where: () => ({stepID:this.id}), cache: this._CACHE_INVARIANT}) // prettier-ignore
   // = new LiveCollection<TABLES['media_3d_displacement']>({table: () => this.db.media_3d_displacement, where: () => ({stepID:this.id}), cache: this._CACHE_INVARIANT}) // prettier-ignore
   // = new LiveCollection<TABLES['media_splat']>          ({table: () => this.db.media_splat,          where: () => ({stepID:this.id}), cache: this._CACHE_INVARIANT}) // prettier-ignore
   // = new LiveCollection<TABLES['comfy_workflow']>       ({table: () => this.db.comfy_workflow,        where: () => ({stepID:this.id}), cache: this._CACHE_INVARIANT}) // prettier-ignore
   // = new LiveCollection<TABLES['comfy_prompt']>         ({table: () => this.db.comfy_prompt,         where: () => ({stepID:this.id}), cache: this._CACHE_INVARIANT}) // prettier-ignore
   // = new LiveCollection<TABLES['runtime_error']>        ({table: () => this.db.runtime_error,         where: () => ({stepID:this.id}), cache: this._CACHE_INVARIANT}) // prettier-ignore

   get currentlyExecutingOutput(): Maybe<StepOutput> {
      return this.comfy_prompts.find((p: ComfyPromptL) => !p.data.executed)
   }
   get lastMediaOutput(): Maybe<StepOutput> {
      const outputs = this.outputs

      const last = outputs[outputs.length - 1]
      if (
         last instanceof MediaImageL || //
         last instanceof MediaVideoL ||
         last instanceof Media3dDisplacementL ||
         last instanceof MediaCustomL ||
         last instanceof MediaTextL ||
         last instanceof MediaImageL ||
         last instanceof RuntimeErrorL
      ) {
         return last
      }

      return null
   }
   get lastOutput(): Maybe<StepOutput> {
      const outputs = this.outputs
      return outputs[outputs.length - 1]
   }
   get outputs(): StepOutput[] {
      return [
         //
         ...this.texts,
         ...this.images,
         ...this.videos,
         ...this.splats,
         ...this.displacements,
         ...this.customOutputs,
         ...this.comfy_workflows,
         ...this.comfy_prompts,
         ...this.runtimeErrors,
      ].sort((a, b) => a.createdAt - b.createdAt)
   }

   runtime: Maybe<Runtime> = null

   // get collage() {
   //     const imgs = this.generatedImages
   //     const last = imgs[imgs.length - 1]
   //     if (last == null) return
   //     if (this.focusedOutput == null) return this.generatedImages
   // }

   recordError = (message: string, infos: any): void => {
      this.db.runtime_error.create({
         stepID: this.id,
         graphID: this.outputWorkflow.id,
         message,
         infos,
      })
   }

   // UI expand/collapse state
   get defaultExpanded(): boolean {
      return this.data.isExpanded === SQLITE_true ? true : false
   }

   userDefinedExpanded: Maybe<boolean> = null

   get expanded(): boolean {
      return this.userDefinedExpanded ?? this.defaultExpanded
   }

   set expanded(next: boolean) {
      this.update({ isExpanded: next ? SQLITE_true : SQLITE_false })
   }
}
