export const getIconForFilePath = (filePath: string): React.JSX.Element => {
   if (filePath.endsWith('.ts')) return <span className='material-symbols-outlined text-blue-600'>code</span>
   if (filePath.endsWith('.png')) return <span className='material-symbols-outlined text-red-700'>image</span>
   if (filePath.endsWith('.json'))
      return <span className='material-symbols-outlined text-yellow-600'>all_out</span>
   if (filePath.endsWith('.txt'))
      return <span className='material-symbols-outlined text-yellow-600'>text_fields</span>
   return <span className='text-gray-500'>❓</span>
}
