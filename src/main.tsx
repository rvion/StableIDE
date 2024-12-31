// ------------------------------------------------------------
// GLOBAL MODULES THAT PATCH WINDOW
// make sure presenter is properly injected
// those modules must NOT export anything; only
// - patch WINDOW
// - add some if (import.meta.hot) { ... } to manually invalidate stuff
import './csuite-cushy/presenters/RenderCatalog' // allow for simple react component usage without import
import './csuite-cushy/presenters/Renderer' // field render engine; here because codebase independant
import './csuite-cushy/presenters/RenderDefaults' // default set of render rules; we want those easy to hot reload without breaking anything
// -----------------------------------------------------------
import './theme/twin.css'
import 'react-toastify/dist/ReactToastify.css'
import 'highlight.js/styles/stackoverflow-dark.css'
import './theme/flexlayout.css'
import './theme/index.css'
import './theme/daisy-tweaks.css'
import './theme/codemirror.css'
import './theme/form.css'
import './theme/markdown.css'
import './theme/Tree.css'
import './theme/theme.css'
import './csuite/input-number/InputNumberUI.css'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ReactDOM from 'react-dom/client'

import { MainUI } from './widgets/misc/MainUI'

const root = document.getElementById('root') as HTMLElement

function updateMousePosition(e: MouseEvent): void {
   if (!cushy) {
      return
   }
   cushy.mousePosition = { x: e.clientX, y: e.clientY }
}
window.document.addEventListener('mousemove', updateMousePosition)
window.document.addEventListener('mouseenter', updateMousePosition)
window.document.addEventListener('mouseleave', updateMousePosition)
window.document.addEventListener('mousedown', updateMousePosition)
window.document.addEventListener('mouseout', updateMousePosition)
window.document.addEventListener('mouseover', updateMousePosition)
window.document.addEventListener('mouseup', updateMousePosition)
window.document.addEventListener('drag', updateMousePosition)
window.document.addEventListener('dragstart', updateMousePosition)
window.document.addEventListener('dragend', updateMousePosition)
window.document.addEventListener('dragover', updateMousePosition)
window.document.addEventListener('dragenter', updateMousePosition)
window.document.addEventListener('dragleave', updateMousePosition)

ReactDOM.createRoot(root).render(
   <DndProvider backend={HTML5Backend}>
      <MainUI />
   </DndProvider>,
)
