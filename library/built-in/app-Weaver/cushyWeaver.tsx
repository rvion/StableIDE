import { _cushyWeaverLayout } from './_WeaverLayout'
import { _cushyWeaverRun } from './_WeaverRun'
import { type $CushyWeaverUI, _cushyWeaverSchema } from './_WeaverSchema'

export type FIELD = $CushyWeaverUI['$Field']

app<FIELD>({
   metadata: {
      name: 'Weaver',
      illustration: 'library/built-in/_illustrations/mc.jpg',
      description: "An app that allows creating a variable amount of workflows as you need, based on a stacking system similar to Blender's modifier system. The Socialable Weaver", // prettier-ignore
   },
   ui: _cushyWeaverSchema,
   layout: _cushyWeaverLayout(),
   run: _cushyWeaverRun,
   version: { major: 0, minor: 1, patch: 0 },
})
