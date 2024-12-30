export const isValidPromptLangIdentifier = (text: string): boolean => {
   return /^[A-Za-z0-9._\\/-]+$/.test(text)
}
