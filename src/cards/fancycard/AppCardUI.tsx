import type { CushyAppL } from '../../models/CushyApp'

import { observer } from 'mobx-react-lite'

import { InputBoolFlipButtonUI } from '../../csuite/checkbox/InputBoolFlipButtonUI'
import { Frame } from '../../csuite/frame/Frame'
import { AppIllustrationUI } from './AppIllustrationUI'

export const AppCardUI = observer(function FancyCardUI_(p: {
   //
   // deck: Package
   app: CushyAppL
   active?: boolean
}) {
   const app = p.app
   const file = app.file
   // const importedFrom
   // prettier-ignore
   const color = ((): React.JSX.Element | undefined => {
        const tw='px-1 py-0.5 overflow-hidden text-ellipsis block whitespace-nowrap self-stretch'
        const maxWidth = cushy.library.imageSize
        if (file.absPath.endsWith('.ts'))   return <Frame base={{hueShift:  60, chroma: .1 }} tw={[tw]} style={{maxWidth}}>Cushy App</Frame>
        if (file.absPath.endsWith('.json')) return <Frame base={{hueShift: 120, chroma: .1 }} tw={[tw]} style={{maxWidth}}>ComfyUI Workflow JSON</Frame>
        if (file.absPath.endsWith('.png'))  return <Frame base={{hueShift: 180, chroma: .1 }} tw={[tw]} style={{maxWidth}}>ComfyUI Workflow Image</Frame>
    })()

   return (
      <Frame
         base={app.file.fPath.existsSync ? 8 : { hue: 0, chroma: 0.1, contrast: 0.8 }}
         hover
         border
         style={{ width: cushy.library.imageSize }}
         onClick={p.app.openLastOrCreateDraft}
         tw={['flex flex-col px-1 shadow-xl', p.active ? 'active' : 'not-active', 'cursor-pointer']}
      >
         {app.file.fPath.UIDiagnosticBadge()}
         {/* {app.file.fPath.existsSync} */}
         {/* ROW 1 */}
         <div tw='flex flex-grow items-start'>
            {/* NAME */}
            <div
               //
               style={{ width: cushy.library.imageSize, height: '2rem' }}
               tw='overflow-hidden overflow-ellipsis pt-1 font-bold [line-height:1rem]'
            >
               {app.name}
            </div>
         </div>

         {/* ROW 2 */}
         <div tw='relative flex'>
            {/* ILLUSTRATION */}
            <AppIllustrationUI app={app} size={cushy.library.imageSize} />
            <div tw='relative h-full w-full'></div>
            {cushy.library.showFavorites ? (
               <InputBoolFlipButtonUI
                  tw='absolute right-0'
                  toggleGroup='favorite'
                  value={app.isFavorite}
                  onValueChange={(v) => app.setFavorite(v)}
                  iconSize='1.3rem'
                  icon={app.isFavorite ? 'mdiStar' : 'mdiStarOutline'}
                  // onClick={(ev) => {
                  //    ev.preventDefault()
                  //    ev.stopPropagation()
                  // }}
               />
            ) : null}
            {/* DESCRIPTION */}
            {cushy.library.showDescription ? (
               <div tw='ml-1 flex w-44 flex-grow flex-col'>
                  {/* <div>
                            {(file.manifest.categories ?? []).map((i, ix) => (
                                <Tag key={ix}>{i}</Tag>
                            ))}
                        </div> */}
                  {/* <div style={{ height: '5rem' }} tw='m-1 flex-grow text-sm'>
                            {file.description}
                        </div> */}
               </div>
            ) : null}
         </div>

         {/* ROW 3 */}
         {/* PATH */}
         <div tw='overflow-hidden overflow-ellipsis whitespace-nowrap text-xs italic text-opacity-50'>
            {file.relPath}
         </div>

         {/* ROW 4 */}
         {/* KIND */}
         {color}
      </Frame>
   )
})
