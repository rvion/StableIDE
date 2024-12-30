import type { RevealPlacement } from '../../csuite/reveal/RevealPlacement'
import type { Trigger } from '../trigger/Trigger'
import type { Routine } from './Routine'
import type { FC, KeyboardEvent, MouseEvent, UIEvent } from 'react'

export type DomId = string

export type ActivityUIProps = {
   activity: Activity
   routine: Routine
   /** call that function to stop the activity */
   stop: () => void
}

/**
 * Activities are <....TODO>
 *
 * You can construct activities without using classes
 * by providing any object that have some of those fields
 * but you may prefer to create activities
 * by extending the `SimpleActivity` class in case you want
 * a bit more utilies packed in, like state management
 */
export type Activity = {
   /** @default false */
   backdrop?: boolean

   /** @default false */
   stopOnBackdropClick?: boolean

   /**
    * hitting `escape` key will stop the activity
    * @default true */
   stopOnEscapeKey?: boolean

   /** human-readable activity title */
   title?: Maybe<string>

   /** if specified, the activity is bound the the given ID */
   bound?: DomId | null

   /** will be executed when activity start */
   onStart?: () => void

   /** will be executed when activity end */
   onStop?: () => void

   /**
    * everytime an event bubbles upward to the activity root, it will
    * pass through this function
    */
   onEvent?: (event: UIEvent, routine: Routine) => Trigger | null

   /**
    * then if not cancelled, and if defined, will be passed
    * to the those
    */
   onAuxClick?: (event: MouseEvent, routine: Routine) => void
   onClick?: (event: MouseEvent, routine: Routine) => void
   onMouseMove?: (event: MouseEvent, routine: Routine) => void
   onMouseUp?: (event: MouseEvent, routine: Routine) => void
   onMouseDown?: (event: MouseEvent, routine: Routine) => void
   onMouseEnter?: (event: MouseEvent, routine: Routine) => void
   onMouseLeave?: (event: MouseEvent, routine: Routine) => void

   onKeyUp?: (event: KeyboardEvent, routine: Routine) => void
   onKeyDown?: (event: KeyboardEvent, routine: Routine) => void

   /**
    * @since 2024-05-21
    * @default null
    * how shells are wrapped
    */
   shell?: Maybe<'popup-lg' | 'popup-sm' | 'popup-full'>

   /**
    * activity UI overlay
    * you can leave that empty if you only care about processign events
    * */
   UI?: FC<ActivityUIProps>

   /**
    * @since 2024-05-21
    * mouse event this activity was started from
    * if specified, allow the activity to position itself relative to the mouse if need be
    */
   event?: MouseEvent

   /**
    * @since 2024-05-21
    * use placement position the activity container origin
    */
   placement?: RevealPlacement
}
