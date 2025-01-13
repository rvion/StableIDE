import {
   autocompletion,
   closeBrackets,
   closeBracketsKeymap,
   completionKeymap,
} from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
   bracketMatching,
   defaultHighlightStyle,
   foldGutter,
   foldKeymap,
   indentOnInput,
   syntaxHighlighting,
} from '@codemirror/language'
import { lintGutter, lintKeymap } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState, type Extension } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import {
   crosshairCursor,
   drawSelection,
   dropCursor,
   EditorView,
   highlightActiveLineGutter,
   highlightSpecialChars,
   keymap,
   lineNumbers,
   rectangularSelection,
} from '@codemirror/view'

import { PromptKeymap1 } from './COMMANDS'
import { placeholders } from './DECORATION'
import { simpleLezerLinter } from './LINT2'

export { EditorView } from '@codemirror/view'

/* Disables newline from ctrl + enter */
const customKeymap = defaultKeymap.map((binding) => {
   if (binding.key === 'Mod-Enter') {
      return { key: binding.key, run: (): boolean => false }
   }
   return binding // Keep other bindings as is
})

export const basicSetup = ((): Extension[] => [
   EditorView.lineWrapping,
   simpleLezerLinter(),
   lintGutter(),
   placeholders,
   oneDark,
   lineNumbers(),
   PromptKeymap1(),
   highlightActiveLineGutter(),
   highlightSpecialChars(),
   history(),
   // foldGutter(),
   drawSelection(),
   dropCursor(),
   EditorState.allowMultipleSelections.of(true),
   indentOnInput(),
   syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
   bracketMatching(),
   closeBrackets(),
   autocompletion(),
   rectangularSelection(),
   crosshairCursor(),
   // highlightActiveLine(),
   highlightSelectionMatches(),
   keymap.of([
      ...closeBracketsKeymap,
      // ...defaultKeymap,
      ...customKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
   ]),
])()
