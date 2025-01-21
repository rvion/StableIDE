import { existsSync, writeFileSync } from 'fs'
import { observer, useLocalObservable } from 'mobx-react-lite'

import { openExternal } from '../../app/layout/openExternal'
import { Button } from '../../csuite/button/Button'
import { InputStringUI } from '../../csuite/input-string/InputStringUI'
import { MessageErrorUI } from '../../csuite/messages/MessageErrorUI'
import { MessageInfoUI } from '../../csuite/messages/MessageInfoUI'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { toastError } from '../../csuite/utils/toasts'
import { TypescriptHighlightedCodeUI } from '../../widgets/misc/TypescriptHighlightedCodeUI'
import { convertToValidCrossPlatformFileName } from './convertToValidCrossPlatformFileName'

export const CreateAppBtnUI = observer(function CreateAppBtnUI_(p: {}) {
   return (
      <RevealUI
         //
         shell='popup-lg'
         placement='screen-top'
         title='Create an app'
         content={(p) => <CreateAppPopupUI closeFn={() => p.reveal.close()} />}
      >
         <Button look='primary' icon='mdiOpenInNew'>
            Create My App
         </Button>
      </RevealUI>
   )
})

export const CreateAppPopupUI = observer(function CreateAppPopupUI_(p: { closeFn: () => void }) {
   const uist = useLocalObservable(() => ({
      appName: `my-app-${Date.now()}`,
      description: 'my app description',
      get fileName(): string {
         return convertToValidCrossPlatformFileName(uist.appName)
      },
      get relPath(): RelativePath {
         return `library/local/${convertToValidCrossPlatformFileName(uist.appName)}.ts` as RelativePath
      },
      get absPath(): AbsolutePath {
         return `${cushy.rootPath}/${uist.relPath}` as AbsolutePath
      },
      get hasConflict(): boolean {
         return existsSync(uist.absPath)
      },
   }))

   return (
      <div tw='flex flex-col gap-2'>
         <div tw='flex gap-1'>
            <div tw='flex flex-col gap-2'>
               <div>
                  <div tw='font-bold'>App name</div>
                  <InputStringUI
                     tw={[uist.hasConflict && 'rsx-field-error']}
                     autoFocus
                     getValue={() => uist.appName}
                     setValue={(next) => (uist.appName = next)}
                  />
                  {uist.hasConflict && <MessageErrorUI markdown='File alreay exist' />}
               </div>
               <div>
                  <div tw='font-bold'>Description</div>
                  <InputStringUI
                     getValue={() => uist.description}
                     setValue={(next) => (uist.description = next)}
                  />
               </div>
            </div>
            <div tw='p-2'>
               <MessageInfoUI markdown={` This file will be created as  \`${uist.relPath}\``} />
               <TypescriptHighlightedCodeUI
                  tabIndex={-1}
                  code={mkAppTemplate({
                     description: uist.description,
                     name: uist.appName,
                  })}
               />
            </div>
         </div>
         <div tw='flex'>
            <Button
               size='lg'
               look='success'
               tw={['ml-auto', uist.hasConflict && 'btn-disabled rsx-field-error']}
               onClick={async () => {
                  if (uist.hasConflict) return toastError('file already exist, change app name')
                  //
                  const fname = convertToValidCrossPlatformFileName(uist.appName)
                  const relPath = `library/local/${fname}.ts` as RelativePath
                  const path = `${cushy.rootPath}/${relPath}`
                  writeFileSync(
                     path,
                     mkAppTemplate({ name: uist.appName, description: uist.description }),
                     'utf-8',
                  )
                  const file = cushy.library.getFile(relPath)
                  const res = await file.extractScriptFromFile()
                  if (res.type === 'failed') return toastError('failed to extract script')
                  const script = res.script
                  script.evaluateAndUpdateAppsAndViews()
                  const apps = script._apps_viaScript
                  if (apps == null) return toastError('no app found (apps is null)')
                  if (apps.length === 0) return toastError('no app found (apps.length === 0)')
                  const firstApp = apps[0]!
                  firstApp.openLastOrCreateDraft()
                  void script.openInVSCode()
                  p.closeFn()
               }}
            >
               Create
            </Button>
         </div>
         <IntroTxt />
      </div>
   )
})

const mkAppTemplate = (p: {
   //
   name: string
   description: string
}): string => {
   return `\
app({
    metadata: {
        name: ${JSON.stringify(p.name)},
        description: ${JSON.stringify(p.description)},
    },
    ui: (b) => b.fields({
        model: b.enum["CheckpointLoaderSimple.ckpt_name"]({}),
        positive: b.string({ default: 'masterpiece, tree' }),
        seed: b.seed({}),
    }),
    run: async (run, ui) => {
        const workflow = run.workflow
        const graph = workflow.builder

        const ckpt = graph.CheckpointLoaderSimple({ ckpt_name: ui.model })
        const latent = graph.EmptyLatentImage({})
        const image = graph.VAEDecode({
            samples: graph.KSampler({
                seed: ui.seed,
                latent_image: latent,
                model: ckpt,
                sampler_name: 'ddim',
                scheduler: 'karras',
                positive: graph.CLIPTextEncode({ clip: ckpt, text: ui.positive }),
                negative: graph.CLIPTextEncode({ clip: ckpt, text: '' }),
            }),
            vae: ckpt,
        })

        graph.PreviewImage({ images: image })
        await workflow.sendPromptAndWaitUntilDone()
    },
})
`
}

const IntroTxt = (): React.JSX.Element => {
   return (
      <MessageInfoUI title='Memo'>
         <div>
            <div>Cushy apps are "just" typescript file (with a few tweaks)</div>
            You <b>don't</b> need this popup to create a Cushy App; you can simply create a file in the{' '}
            <div tw='inline-flex items-center'>
               <b tw='underline' onClick={() => openExternal(`file://${cushy.libraryFolderPathAbs}/local`)}>
                  library/local
               </b>
               <span className='material-symbols-outlined !text-sm'>open_in_new</span>
            </div>
            folder
         </div>
      </MessageInfoUI>
   )
}
