import type { Field } from '../../csuite/model/Field'
import type { WidgetsCatalog } from './RenderCatalog'
import type { DisplaySlots } from './RenderSlots'
import type { FieldUIConf } from './RenderTypes'
import type { FC } from 'react'

export type CatalogVariants<N extends CATALOG.AllFieldTypes> = any

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
   namespace RENDERER {
      type UIConf<FIELD extends Field> = FieldUIConf<FIELD>
      interface FieldRenderArgs<out FIELD extends Field> extends DisplaySlots<FIELD> {
         rule?: FieldUIConf<FIELD>
      }
   }

   interface Window {
      RENDERER: {
         Render: FC<{ field: Field } & RENDERER.FieldRenderArgs<any>>
      }
   }

   namespace CATALOG {
      type variants = { [k in AllFieldTypes]: CatalogVariants<k> }
      type widgets = WidgetsCatalog
      /** closed union to help typescript proove variance by checking all branches */
      type AllFieldTypes =
         | 'optional'
         | 'str'
         | 'group'
         | 'selectOne'
         | 'selectMany'
         | 'bool'
         | 'button'
         | 'choices'
         | 'color'
         | 'custom'
         | 'date'
         | 'date'
         | 'plaindate'
         | 'datetimezoned'
         | 'enum'
         | 'image'
         | 'link'
         | 'dynamic'
         | 'list'
         | 'markdown'
         | 'matrix'
         | 'number'
         | 'orbit'
         | 'seed'
         | 'shared'
         | 'size'
         | 'prompt'
   }
}
