import type { DraftL } from '../../models/Draft'

import { existsSync } from 'fs'
import { observer } from 'mobx-react-lite'
import { fileURLToPath } from 'url'

import { useDragDropRefForReact19, useImageDrop } from '../../widgets/galleries/dnd'
import { ImageErrorDisplayUI } from '../../widgets/galleries/ImageErrorDisplayUI'
import { AppIllustrationUI } from './AppIllustrationUI'

export const DraftIllustrationUI = observer(function DraftIllustrationUI_(p: {
   className?: string
   onClick?: () => void
   draft: Maybe<DraftL>
   revealAppIllustrationOnHover?: boolean
   size: string
}) {
   const [dropStyle, dropRef__] = useImageDrop(cushy, (img) => {
      if (p.draft == null) return
      img.useAsDraftIllustration(p.draft)
   })
   const dropRef = useDragDropRefForReact19(dropRef__)

   // 1. no draft
   const draft = p.draft
   if (draft == null)
      return (
         <div
            //
            tw='bg-error text-error-content'
            style={{ height: p.size }}
         >
            ERROR
         </div>
      )

   // 2. draft with no specific illustration
   if (draft.data.illustration == null) {
      return (
         <div style={dropStyle} ref={dropRef} className='DROP_IMAGE_HANDLER'>
            <AppIllustrationUI app={draft.app} size={p.size} />
         </div>
      )
   }

   const illustration = fileURLToPath(draft.data.illustration)

   // 3. show illustration on top
   return (
      <div style={dropStyle} ref={dropRef} className='DROP_IMAGE_HANDLER relative'>
         {p.revealAppIllustrationOnHover ? ( //
            <div
               tw='bg-neutral absolute z-50 opacity-0 hover:opacity-100'
               style={{ transition: 'opacity 0.2s' }}
            >
               <AppIllustrationUI app={draft.app} size={p.size} />
            </div>
         ) : null}
         {existsSync(illustration) ? (
            <img
               // onError={(ev) => {
               // TODO 2024-01-25 rvion: make it so wiping images doesn't break drafts too much
               // }}
               className={p.className}
               loading='lazy'
               tw={['rounded', p.onClick ? 'cursor-pointer' : null]}
               style={{ width: p.size, height: p.size, objectFit: 'contain' }}
               src={draft.data.illustration}
               alt='draft illustration'
               onClick={p.onClick}
            />
         ) : (
            <div style={{ width: p.size, height: p.size, objectFit: 'contain' }}>
               <ImageErrorDisplayUI icon='mdiFolder' />
            </div>
         )}
      </div>
   )
})
