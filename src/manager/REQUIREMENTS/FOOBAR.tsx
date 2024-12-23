import type { CivitaiSearchResultItem } from '../../panels/PanelModels/CivitaiTypes'

import { observer } from 'mobx-react-lite'

import { Button } from '../../csuite/button/Button'
import { RevealUI } from '../../csuite/reveal/RevealUI'
import { usePromise } from '../../csuite/utils/usePromise'
import { CivitaiDownloadableFileUI } from '../../panels/PanelModels/CivitaiDownloadableFileUI'

// https://civitai.com/models/795765/illustrious-xl
// https://civitai.com/api/download/models/889818?type=Model&format=SafeTensor&size=pruned&fp=fp16
const testDataIllustrious = {
   modelId: 795765,
   modelVersionId: 889818,
}

export const IntallBtnForKnownCivitaiModelId = observer(function IntallBtnForKnownCivitaiModelId_(p: {
   civitaiModelId?: string | number
}) {
   const x = usePromise(() => {
      const apiKey = cushy.civitaiConf.fields.apiKey.value // retrieve api key
      if (!apiKey) return Promise.resolve({ error: 'no api key' })
      let url = `https://civitai.com` // base civitai url (or later proxy to civitai when you live in a bad country)
      url = `${url}/api/v1/models/${p.civitaiModelId || testDataIllustrious.modelId}` // enpoint url
      url = `${url}${url.includes('?') ? '&' : '?'}token=${apiKey}` // inject api key
      return fetch(url, {
         method: 'GET',
         headers: { 'Content-Type': 'application/json' },
      }).then((x) => x.json())
   }, [])
   if (x.value == null) return <div>Loading...</div>
   const req = x.value as Maybe<CivitaiSearchResultItem>
   return (
      <RevealUI content={() => <pre>{JSON.stringify(req, null, 2)}</pre>}>
         <Button loading={req == null}>Civitai Model Id</Button>
         {req && req.modelVersions?.length === 0 && <div>no model versions</div>}
         {req && req.modelVersions?.length > 0 && (
            <CivitaiDownloadableFileUI //
               entry={req}
               version={req.modelVersions?.[0]!}
               file={req.modelVersions?.[0]!.files[0]!}
            />
         )}
      </RevealUI>
   )
})

export const IntallBtnForKnownCivitaiModelVersionId = observer(
   function IntallBtnForKnownCivitaiModelVersionId_(p: { civitaiModelVersionId?: string | number }) {
      const x = usePromise(() => {
         const apiKey = cushy.civitaiConf.fields.apiKey.value // retrieve api key
         if (!apiKey) return Promise.resolve({ error: 'no api key' })
         let url = `https://civitai.com` // base civitai url (or later proxy to civitai when you live in a bad country)
         url = `${url}/api/v1/model-versions/${p.civitaiModelVersionId || testDataIllustrious.modelVersionId}` // enpoint url
         url = `${url}${url.includes('?') ? '&' : '?'}token=${apiKey}` // inject api key
         return fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
         }).then((x) => x.json())
      }, [])
      const req = x.value
      return (
         <RevealUI content={() => <pre>{JSON.stringify(req, null, 2)}</pre>}>
            <Button loading={req == null}>Civitai Model-Version Id</Button>
         </RevealUI>
      )
   },
)

// {
//     /* <Button_InstalModelViaManagerUI
//     optional={req.optional ?? false}
//     modelInfo={{
//         name: 'negative_hand Negative Embedding',
//         type: 'embeddings',
//         base: req.base,
//         save_path: 'default',
//         description:
//             'If you use this embedding with negatives, you can solve the issue of damaging your hands.',
//         reference: 'https://civitai.com/models/56519/negativehand-negative-embedding',
//         filename: 'negative_hand-neg.pt',
//         url: 'https://civitai.com/api/download/models/60938',
//         size: '1.2Mb',
//     }}
// /> */
// }
