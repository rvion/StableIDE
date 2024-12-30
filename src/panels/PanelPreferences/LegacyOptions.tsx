import { observer } from 'mobx-react-lite'

import { KEYS } from '../../app/shortcuts/shorcutKeys'
import { ComboUI } from '../../csuite/accelerators/ComboUI'
import { Button } from '../../csuite/button/Button'
import { InputBoolCheckboxUI } from '../../csuite/checkbox/InputBoolCheckboxUI'
import { InputNumberUI } from '../../csuite/input-number/InputNumberUI'
import { InputStringUI } from '../../csuite/input-string/InputStringUI'
import { parseFloatNoRoundingErr } from '../../csuite/utils/parseFloatNoRoundingErr'
import { openInVSCode } from '../../utils/electron/openInVsCode'
import { LegacyFieldUI } from './LegacyFieldUI'

export const LegacyOptions = observer(function LegacyOptions_() {
   const config = cushy.configFile

   return (
      <div tw='flex flex-col'>
         <div className='divider'>Legacy config fields to migrate 👇:</div>
         <div tw='flex flex-col gap-1'>
            <LegacyFieldUI label='Config file path'>
               <Button look='link' icon='mdiOpenInNew' expand onClick={() => openInVSCode(config.path)}>
                  {config.path}
               </Button>
            </LegacyFieldUI>
            <LegacyFieldUI label='Set tags file'>
               <input
                  tw='csuite-basic-input w-full'
                  name='tagFile'
                  value={config.get('tagFile') ?? 'completions/danbooru.csv'}
                  onChange={(ev) => config.update({ tagFile: ev.target.value })}
               />
            </LegacyFieldUI>
            <LegacyFieldUI label='Your github username'>
               <input //
                  tw='csuite-basic-input w-full'
                  value={config.value.githubUsername}
                  onChange={(ev) => config.update({ githubUsername: ev.target.value })}
                  name='githubUsername'
               />
            </LegacyFieldUI>
            <LegacyFieldUI label='Number slider speed multiplier'>
               <InputNumberUI //
                  placeholder='Number slider speed multiplier'
                  softMin={0.3}
                  softMax={3}
                  step={0.1}
                  value={config.value.numberSliderSpeed ?? 1}
                  mode='float'
                  onValueChange={(val) => config.update({ numberSliderSpeed: val })}
               />
            </LegacyFieldUI>
            <LegacyFieldUI label='Enable TypeChecking Default Apps'>
               <InputBoolCheckboxUI
                  toggleGroup='legacy-options'
                  onValueChange={(next) => config.update({ enableTypeCheckingBuiltInApps: next })}
                  value={config.value.enableTypeCheckingBuiltInApps ?? false}
               />
            </LegacyFieldUI>
            <LegacyFieldUI label='Check update every X minutes'>
               <input //
                  tw='csuite-basic-input w-full'
                  type='number'
                  placeholder='48'
                  name='galleryImageSize'
                  value={config.value.checkUpdateEveryMinutes ?? 5}
                  min={0.5}
                  onChange={(ev) => {
                     const next = ev.target.value
                     config.update({
                        checkUpdateEveryMinutes:
                           typeof next === 'string' //
                              ? parseFloatNoRoundingErr(next, 2)
                              : typeof next === 'number'
                                ? next
                                : 5,
                     })
                  }}
               />
            </LegacyFieldUI>
            <LegacyFieldUI label='OpenRouter API KEY'>
               <InputStringUI
                  icon='mdiKey'
                  type='password'
                  getValue={() => config.value.OPENROUTER_API_KEY ?? ''}
                  setValue={(next) => config.update({ OPENROUTER_API_KEY: next })}
               />
            </LegacyFieldUI>
            <LegacyFieldUI label='Configure hosts:'>
               <Button icon={'mdiOpenInNew'} onClick={() => cushy.layout.open('Hosts', {})}>
                  Open Hosts page
                  <ComboUI combo={KEYS.openPage_Hosts} />
               </Button>
            </LegacyFieldUI>
            <LegacyFieldUI label='Local folder to save favorites:'>
               <InputStringUI
                  icon='mdiFolderStar'
                  getValue={() => config.value.favoriteLocalFolderPath ?? ''}
                  setValue={(next) => config.update({ favoriteLocalFolderPath: next })}
               />
            </LegacyFieldUI>
         </div>
      </div>
   )
})
