import type { MediaImageT } from '../db/TYPES.gen'
import type { CustomDataL } from '../models/CustomData'
import type { MediaImageL } from '../models/MediaImage'

import { makeAutoObservable } from 'mobx'

export type ImageStoreT = {
   imageID?: Maybe<MediaImageID>
}

export type ImageStoreAutoUpdateLogic = (image: MediaImageL) => void

export class ImageStore {
   constructor(
      // /** if this functio is provided,  */
      // public selfUpdateLogic?: ImageStoreAutoUpdateLogic,
      /** the CustomData DB store,that is persisted and shared across runs */
      public store: CustomDataL<ImageStoreT>,
   ) {
      //
      makeAutoObservable(this)
   }

   get hasImage(): boolean {
      return !!this.imageID
   }
   //  ------------------- getters
   get image(): Maybe<MediaImageL> {
      return this.store.st.db.media_image.get(this.imageID)
   }
   get imageOrCrash(): MediaImageL {
      return this.store.st.db.media_image.getOrThrow(this.imageID!)
   }
   get data(): ImageStoreT {
      return this.store.get()
   }
   get imageID(): Maybe<MediaImageID> {
      return this.data.imageID
   }

   // -------------------- actions
   set(img: MediaImageL | MediaImageT | MediaImageID): void {
      const id = typeof img === 'string' ? img : img.id
      const nextValue: ImageStoreT = { imageID: id }
      this.store.update({ json: nextValue })
   }

   /** manually empty the store */
   clear(): void {
      const nextValue: ImageStoreT = {}
      this.store.update({ json: nextValue })
   }
}
