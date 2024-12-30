import type { SQLWhere } from '../../../db/SQLWhere'
import type { MediaImageT } from '../../../db/TYPES.gen'
import type { MediaImageL } from '../../../models/MediaImage'
import type { BaseSchema } from '../../model/BaseSchema'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { Repository } from '../../model/Repository'
import type { Problem_Ext } from '../../model/Validation'

import { produce } from 'immer'

import { Field } from '../../model/Field'
import { registerFieldClass } from '../WidgetUI.DI'
import { WidgetSelectImageUI } from './WidgetImageUI'

// #region Config
export type Field_image_config = FieldConfig<
   {
      default?: MediaImageL
      suggestionWhere?: SQLWhere<MediaImageT>
      assetSuggested?: RelativePath | RelativePath[]
   },
   Field_image_types
>

// #region Serial
export type Field_image_serial = FieldSerial<{
   $: 'image'

   imageID?: Maybe<MediaImageID>

   /** for form expiration */
   imageHash?: string

   /**
    * Height of the resizable frame's content,
    * the width is aspect ratio locked.
    */
   size?: number
}>

// #region Value
export type Field_image_value = MediaImageL

// #region Types
export type Field_image_types = {
   $Type: 'image'
   $Config: Field_image_config
   $Serial: Field_image_serial
   $Value: Field_image_value
   $Unchecked: Field_image_value | undefined
   $Field: Field_image
   $Child: never
   $Reflect: Field_image_types
}

// #region STATE
export class Field_image extends Field<Field_image_types> {
   // #region static
   static readonly type: 'image' = 'image'
   static readonly emptySerial: Field_image_serial = { $: 'image' }
   static migrateSerial(): undefined {}
   static codegenValueType(config: Field_image_config): string {
      return `MediaImageL`
   }

   // #region constructor
   constructor(
      repo: Repository,
      root: Field | null,
      parent: Field | null,
      schema: BaseSchema<Field_image>,
      initialMountKey: string,
      serial?: Field_image_serial,
   ) {
      super(repo, root, parent, schema, initialMountKey, serial)
      this.init(serial, {
         DefaultHeaderUI: false,
         DefaultBodyUI: false,
      })
   }

   // #region serial
   get isOwnSet(): boolean {
      return this.serial.imageID != null
   }

   protected setOwnSerial(next: Field_image_serial): void {
      // apply default if unset + default in config
      const def = this.config.default
      if (this.serial.imageID == null && def != null) {
         next = produce(next, (draft) => {
            draft.imageID = def.id
         })
      }

      this.assignNewSerial(next)
   }

   // #region UI
   DefaultHeaderUI: undefined = undefined
   DefaultBodyUI = WidgetSelectImageUI

   // #region UI/helpers
   get animateResize(): boolean {
      return false
   }

   // #region Validation
   get ownConfigSpecificProblems(): Problem_Ext {
      return null
   }

   get ownTypeSpecificProblems(): Problem_Ext {
      return null
   }

   // #region ...
   get defaultValue(): MediaImageL | undefined {
      return this.config.default
   }

   get hasChanges(): boolean {
      return this.value !== this.defaultValue
   }

   // #region value
   get value(): MediaImageL {
      return this.value_or_fail
   }

   set value(next: MediaImageL) {
      if (this.serial.imageID === next.id) return
      this.runInTransaction(() => {
         this.patchSerial((draft) => {
            draft.imageID = next.id
         })
      })
   }

   get value_or_zero(): MediaImageL {
      if (this.serial.imageID == null) return cushy.defaultImage
      return cushy.db.media_image.get(this.serial.imageID) ?? cushy.defaultImage
   }

   get value_or_fail(): MediaImageL {
      if (this.serial.imageID == null) throw new Error('Field_image.value_or_fail: not set')
      const image = cushy.db.media_image.get(this.serial.imageID)
      if (image == null) throw new Error('Field_image.value_or_fail: not found')
      return image
   }

   get value_unchecked(): MediaImageL | undefined {
      if (this.serial.imageID == null) return
      const image = cushy.db.media_image.get(this.serial.imageID)
      if (image == null) return
      return image
   }

   // #region UI/preview
   /** size of the preview */
   get size(): number {
      return this.serial.size ?? this._defaultPreviewSize
   }

   set size(val: number) {
      this.runInTransaction(() => {
         this.patchSerial((serial) => {
            if (val === this._defaultPreviewSize) delete serial.size
            else serial.size = val
         })
      })
   }

   private get _defaultPreviewSize(): number {
      return 128
   }
}

// DI
registerFieldClass('image', Field_image)
