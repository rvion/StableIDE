import type { ComfyManagerModelInfo } from '../../manager/types/ComfyManagerModelInfo'
import type { CivitaiDownloadableFile, CivitaiModelVersion, CivitaiSearchResultItem } from './CivitaiTypes'

import { observer, useLocalObservable } from 'mobx-react-lite'

import { BadgeUI } from '../../csuite/badge/BadgeUI'
import { Button } from '../../csuite/button/Button'
import { Frame } from '../../csuite/frame/Frame'
import { Ikon } from '../../csuite/icons/iconHelpers'
import { JsonViewUI } from '../../csuite/json/JsonViewUI'
import { MessageWarningUI } from '../../csuite/messages/MessageWarningUI'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { SelectUI } from '../../csuite/select/SelectUI'
import { formatSize } from '../../csuite/utils/formatSize'
import { knownModel_Base, type KnownModel_Base } from '../../manager/generated/KnownModel_Base'
import { knownModel_SavePath, type KnownModel_SavePath } from '../../manager/generated/KnownModel_SavePath'
import { knownModel_Type, type KnownModel_Type } from '../../manager/generated/KnownModel_Type'
import { CivitaiWarningAPIKeyMissingUI } from './CivitaiWarningAPIKeyMissingUI'

const detectBase = ({ version }: CivitaiDownloadableFileProps): Maybe<KnownModel_Base> => {
   // 🔴 TODO: support all knowns Civitai input types
   if (version.baseModel === 'SDXL 1.0') return 'SDXL'
   if (version.baseModel === 'SD 1.5') return 'SD1.5'
   return
}

const detectType = (p: CivitaiDownloadableFileProps): Maybe<KnownModel_Type> => {
   // 🔴 TODO: support all knowns Civitai input types
   if (p.entry.type === 'LORA') return 'lora'
   if (p.entry.type === 'Checkpoint') return 'checkpoint'
   // if (p.file.type === 'Model') return 'checkpoints'
   // if (p.file.type === 'VAE') return 'VAE'
   return
}

type CivitaiDownloadableFileProps = {
   //
   entry: CivitaiSearchResultItem
   version: CivitaiModelVersion
   file: CivitaiDownloadableFile
}

export const CivitaiDownloadableFileUI = observer(function CivitaiDownloadableFileUI_(
   p: CivitaiDownloadableFileProps,
) {
   const file: CivitaiDownloadableFile = p.file
   const version: CivitaiModelVersion = p.version
   const apiKey = cushy.civitaiConf.fields.apiKey.value
   const detectedBase = detectBase(p)
   const detectedType = detectType(p)

   const uist = useLocalObservable(
      (): {
         base: KnownModel_Base
         type: KnownModel_Type
         save_path: KnownModel_SavePath
      } => ({
         base: detectedBase ?? 'SD1.x',
         type: detectedType ?? 'checkpoint',
         save_path: 'default',
      }),
   )
   const mi: ComfyManagerModelInfo = {
      description: version.description,
      name: version.name as any,
      filename: file.name,
      reference: version.downloadUrl,
      base: uist.base,
      type: uist.type,
      save_path: uist.save_path,
      url: apiKey //
         ? `${file.downloadUrl}${file.downloadUrl.includes('?') ? '&' : '?'}token=${apiKey}`
         : file.downloadUrl,
      size: `${file.sizeKB * 1000}Mb`,
   }
   const isBeeingInstalled = cushy.mainHost.manager.modelsBeeingInstalled.has(mi.name as any)
   return (
      <Frame border={39} tw='p-1' hover>
         <BadgeUI tw='inline-flex'>type={file.type}</BadgeUI>
         <div // File name
            tw='flex items-center gap-1'
         >
            <Ikon.mdiFile />
            <div tw='flex items-center font-bold'>{file.name}</div>
            <div tw='text-sm underline'>{formatSize(file.sizeKB * 1000)}</div>
            <div tw='flex-1'></div>
            <RevealUI content={() => <JsonViewUI value={file} />}>
               <Button size='xs'>
                  <Ikon.mdiInformation />
                  infos
               </Button>
            </RevealUI>
            {file.primary && <div tw='badge badge-primary'>primary</div>}
         </div>
         <div tw='bd1 m-2'>
            <div tw='flex flex-col'>
               <SelectUI // manually override base
                  label='base model'
                  value={() => uist.base}
                  options={() => knownModel_Base}
                  onOptionToggled={(v) => (uist.base = v)}
                  getLabelText={(v) => v}
               />
               <SelectUI // manually override type
                  label='Model Type'
                  onOptionToggled={(v) => (uist.type = v as any)}
                  getLabelText={(v) => v}
                  value={() => uist.type}
                  options={() => knownModel_Type}
               />

               <SelectUI // manually override save path info
                  label='Save Strategy'
                  onOptionToggled={(v) => (uist.save_path = v as any)}
                  getLabelText={(v) => v}
                  options={() => knownModel_SavePath}
                  value={() => uist.save_path}
               />
               {detectedBase == null ? <MessageWarningUI markdown={errMsg(p, 'Base')} /> : null}
               {detectedType == null ? <MessageWarningUI markdown={errMsg(p, 'Type')} /> : null}
            </div>
            <div tw='flex'>
               <Button // Download button
                  look='primary'
                  loading={isBeeingInstalled}
                  onClick={() => cushy.mainHost.manager.installModel(mi)}
               >
                  {isBeeingInstalled && <div tw='loading loading-spinner'></div>}
                  <span className='material-symbols-outlined'>download</span>
                  Download
               </Button>
               <RevealUI content={() => <JsonViewUI value={mi} />}>
                  <Button>show ComfyManager payload</Button>
               </RevealUI>
            </div>
            <div tw='text-sm'>url: {file.downloadUrl}</div>
         </div>
         {/* api key config */}
         {apiKey ? null : <CivitaiWarningAPIKeyMissingUI />}
         {/* debug payload */}
         {/* url */}
         {/* scans */}
         {/* <div tw='text-sm'>{f.scannedAt}</div> */}
         {/* <div tw='text-sm'>pikle scan: {f.pickleScanResult}</div> */}
         {/* <div tw='text-sm'>virus scan: {f.virusScanResult}</div> */}
      </Frame>
   )
})

const errMsg = (p: CivitaiDownloadableFileProps, prefix: string): string =>
   [
      `**${prefix}** MAY be wrong;`,
      `Case missing (resource-type=${p.entry.type}, baseModel=${p.version.baseModel}, file.type=${p.file.type})`,
      `Please add missing case in \`src/panels/Panel_Models/CivitaiDownloadableFileUI.tsx\` file`,
   ].join('\n\n')
