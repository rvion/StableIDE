import type { ToastPosition } from 'react-toastify'

import { toast } from 'react-toastify'

import { Trigger } from '../trigger/Trigger'

const position: ToastPosition = 'bottom-right'
export const toastSuccess = (msg: string): Trigger => {
   toast(msg, { type: 'success', position })
   return Trigger.UNMATCHED
}
export const toastInfo = (msg: string): Trigger => {
   toast(msg, { type: 'info', position })
   return Trigger.UNMATCHED
}
export const toastError = (msg: string): Trigger => {
   toast(msg, { type: 'error', position })
   return Trigger.UNMATCHED
}

// Function to show toast with an image
export const toastImage = (imageSrc: string | Buffer, message: string): void => {
   const src = typeof imageSrc === 'string' ? imageSrc : imageSrc.toString('base64')
   console.log(src)
   const CustomToast = (): React.JSX.Element => (
      <div tw='flex aspect-square flex-col'>
         <img
            tw='rounded bg-black object-contain'
            src={`${src}`}
            alt='Toast Image'
            style={{ width: '256px', height: '256px' }}
         />
         <p>{message}</p>
      </div>
   )

   toast(<CustomToast />, {
      position: 'bottom-right',
      pauseOnFocusLoss: false,
   })
}
