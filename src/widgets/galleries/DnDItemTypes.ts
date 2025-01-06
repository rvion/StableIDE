import type { NativeTypes } from 'react-dnd-html5-backend'

/** drag and drop item types */
export enum LegacyItemTypes {
   Image = 'Image',
}

export type ItemTypes = 'Image' | 'Text' | '__NATIVE_FILE__'
