import type { Field } from '../../csuite/model/Field'

import { observer } from 'mobx-react-lite'
import { Fragment } from 'react/jsx-runtime'

import { FrameWithCSuiteOverride } from '../../csuite/ctx/CSuiteOverride'
import { FormUI } from '../../csuite/form/FormUI'
import { type FrameAppearance, frameTemplates } from '../../csuite/frame/FrameTemplates'
import { getNthIconName } from '../../csuite/icons/getAllIcons'
import { mapObjectEntries } from '../../csuite/utils/mapObjectEntries'
import { mapObjectValues } from '../../csuite/utils/mapObjectValues'
import { readJSON, writeJSON } from '../../state/jsonUtils'

export const PlaygroundWidgetDisplay = observer(function PlaygroundRequirements_(p: {}) {
   const doc = useDoc()
   return (
      <Fragment>
         <FrameWithCSuiteOverride
            config={{
               //
               showWidgetUndo: false,
               showWidgetMenu: false,
            }}
         >
            <FormUI field={doc} />
         </FrameWithCSuiteOverride>
         <FormUI field={doc} />
      </Fragment>
   )
})

const useDoc = (): Field<any> => {
   return cushy.forms.use(
      (b) => {
         const booleanForm = {
            check: b.bool({}),
            checkTextNoLabel: b.bool({
               label: false,
               text: 'Text',
            }),
            checkTextAndLabel: b.bool({
               label: 'Check',
               text: 'Text',
            }),
            checkLabelIcon: b.bool({
               label: false,
               text: 'Check Label w icon',
               icon: 'mdiContentSaveOutline',
            }),
            toggleButton: b.bool({
               label: '',
               text: 'Toggle Button',
               display: 'button',
            }),
            toggleButtonIcon: b.bool({
               label: false,
               text: 'Toggle Button Icon',
               display: 'button',
               icon: 'mdiCheckboxOutline',
            }),
            toggleButtonExpand: b.bool({
               label: '',
               text: 'Toggle Button Expand',
               display: 'button',
               expand: true,
            }),
            toggleButtonExpandIcon: b.bool({
               label: '',
               text: 'Toggle Button Expand w Icon',
               display: 'button',
               expand: true,
               icon: 'mdiCheckboxOutline',
            }),
         }

         const intForm = {
            int: b.int(),
            intConstrained: b.int({ min: 0, max: 100, step: 10 }),
            intConstrainedSoft: b.int({ min: 0, max: 100, softMax: 10, step: 10 }),
            intSuffix: b.int({ min: 0, max: 100, step: 10, suffix: 'px' }),
            intLabel: b.int({ label: false, text: 'Inner Label', min: 0, max: 100, step: 10 }),
            intLabelSuffix: b.int({
               label: false,
               text: 'Inner Label Suffix',
               min: 0,
               max: 100,
               step: 10,
               suffix: 'px',
            }),
         }

         const floatForm = {
            float: b.float(),
            floatConstrained: b.float({ min: 0, max: 100, step: 10 }),
            floatConstrainedSoft: b.float({ min: 0, max: 100, softMax: 10, step: 10 }),
            floatSuffix: b.float({ min: 0, max: 100, step: 10, suffix: 'px' }),
            floatLabel: b.float({ label: false, text: 'Inner Label', min: 0, max: 100, step: 10 }),
            floatLabelSuffix: b.float({
               label: false,
               text: 'Inner Label Suffix',
               min: 0,
               max: 100,
               step: 10,
               suffix: 'px',
            }),
         }

         const dateForm = {
            date: b.stringDate(),
            dateTime: b.stringDatetime(),
         }

         const emailForm = {
            email: b.email(),
         }

         const enumForm = {
            choice: b.fields({
               enumSelection: b.choice(
                  Object.fromEntries(Object.entries(b.enum).map(([key]) => [key, b.group()])),
               ),
            }),
         }

         const choiceForm = {
            choice: b.choice(
               { choiceOne: b.group(), choiceTwo: b.group(), choiceThree: b.group() },
               { label: 'Choice' },
            ),
            choices: b.choices(
               { choiceOne: b.group(), choiceTwo: b.group(), choiceThree: b.group() },
               { label: 'Choices' },
            ),
         }
         return b.group({
            // startCollapsed: true,
            items: {
               aligned: b.group({ border: false, items: booleanForm }),
               // notAligned: b.group({ border: false, justifyLabel: false, items: booleanForm }),
            },
         })
         return b.fields({
            manyOf: b.fields({
               selectMany: b.selectManyStrings([
                  'one',
                  'two',
                  'three',
                  'four',
                  'five',
                  'six',
                  'seven',
                  'eight',
                  'nine',
                  'ten',
               ]),
               selectManyErr: b.selectManyStrings(
                  ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
                  { default: 'WRONG' },
               ),
            }),
            boolean: b.group({
               startCollapsed: true,
               items: {
                  aligned: b.group({ border: false, items: booleanForm }),
                  notAligned: b.group({ border: false, justifyLabel: false, items: booleanForm }),
               },
            }),
            string: b.group({
               items: {
                  aligned: b.group({
                     border: false,
                     items: {
                        stringLive: b.string({}),
                        stringBuffered: b.string({ buffered: true }),
                        stringLiveTextarea: b.textarea({}),
                        stringBufferedTextarea: b.textarea({ buffered: true }),
                     },
                  }),
               },
            }),
            int: b.group({
               startCollapsed: true,
               items: {
                  aligned: b.group({
                     border: false,
                     items: intForm,
                  }),
                  notAligned: b.group({
                     border: false,
                     justifyLabel: false,
                     items: intForm,
                  }),
               },
            }),

            float: b.group({
               startCollapsed: true,
               items: {
                  aligned: b.group({
                     border: false,
                     items: floatForm,
                  }),
                  notAligned: b.group({
                     border: false,
                     justifyLabel: false,
                     items: floatForm,
                  }),
               },
            }),

            button: b.group({
               startCollapsed: true,
               items: {
                  button: b.button({}),
                  ...mapObjectValues(frameTemplates, (k, v, ix) =>
                     b.button({
                        text: k,
                        icon: getNthIconName(ix * 10),
                        look: k as FrameAppearance,
                     }),
                  ),
                  ...mapObjectEntries(frameTemplates, (k, v, ix) => [
                     k + '_',
                     b.button({
                        text: k,
                        icon: getNthIconName(1000 + ix * 10),
                        look: k as FrameAppearance,
                        expand: true,
                     }),
                  ]),
               },
            }),

            color: b.group({
               startCollapsed: true,
               items: {
                  v1: b.group({
                     border: false,
                     items: { color: b.color({}), colorN: b.color({ label: false, justifyLabel: false }) },
                  }),
                  v2: b.group({
                     border: false,
                     items: {
                        color: b.colorV2({}),
                        colorN: b.colorV2({ label: false, justifyLabel: false }),
                     },
                  }),
               },
            }),

            date: b.group({
               items: {
                  aligned: b.group({
                     border: false,
                     items: dateForm,
                  }),
                  notAligned: b.group({
                     border: false,
                     justifyLabel: false,
                     items: dateForm,
                  }),
               },
            }),

            email: b.group({
               items: {
                  aligned: b.group({ border: false, items: emailForm }),
                  notAligned: b.group({ border: false, justifyLabel: false, items: emailForm }),
               },
            }),

            enum: b.group({
               items: { aligned: b.group({ border: false, items: enumForm }) },
            }),

            group: b.group({
               items: {
                  group: b.group({ items: { inside: b.float() } }),
                  groupNoAlign: b.group({ justifyLabel: false, items: { inside: b.float() } }),
                  groupNoBorder: b.group({ border: false, items: { inside: b.float() } }),
                  groupNoCollapse: b.group({ collapsed: false, items: { inside: b.float() } }),
                  columnExamples: b.group({
                     items: {
                        column: b.column({
                           top: b.float(),
                           middle: b.float(),
                           bottom: b.float(),
                        }),
                        column2: b.column(
                           {
                              top: b.float({ label: false }),
                              middle: b.float({ label: false }),
                              bottom: b.float({ label: false }),
                           },
                           { border: true, justifyLabel: false },
                        ),
                     },
                  }),
                  rowExamples: b.group({
                     items: {
                        row: b.row({
                           left: b.float(),
                           center: b.float(),
                           right: b.float(),
                        }),
                        row2: b.row(
                           {
                              left: b.float({ label: false }),
                              center: b.float({ label: false }),
                              right: b.float({ label: false }),
                           },
                           { border: true },
                        ),
                     },
                  }),
               },
            }),

            test: b.choice(choiceForm),
         })
      },
      {
         name: 'Playground Widget Showcase',
         serial: () => readJSON('settings/playground_form_display.json'),
         onSerialChange: (form) => writeJSON('settings/playground_form_display.json', form.serial),
      },
   )
}
