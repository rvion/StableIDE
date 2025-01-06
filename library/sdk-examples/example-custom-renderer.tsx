app({
   metadata: {
      name: 'Example custom renderer',
      illustration: 'library/built-in/_illustrations/mc.jpg',
      description: 'Example of a custom renderer',
   },
   ui: (b) =>
      b.fields({
         a: b.header('Custom with a group header using child widgets:'),
         testA: b.fields(
            { a: b.int(), b: b.string(), c: b.string() },
            {
               ui: {
                  Header: ({ field }) => (
                     <div tw='flex'>
                        <field.fields.a.UI Shell={UY.Shell.HeaderOnly} />
                        <field.fields.b.UI Shell={UY.Shell.HeaderOnly} />
                        <field.fields.a.UI Shell={UY.Shell.HeaderOnly} />
                     </div>
                  ),
               },
            },
         ),

         b: b.header('Same as above, but without body:'),
         testB: b.fields(
            { a: b.int(), b: b.string(), c: b.string() },
            {
               ui: {
                  Body: null,
                  Header: () => <div tw='flex'>nothing to see here</div>,
               },
            },
         ),

         c: b.header('Custom boolean header wrapping the default:'),
         testC: b.bool({
            ui: {
               Header: ({ field: widget }) => (
                  <div tw='flex flex-1 whitespace-nowrap'>
                     <div
                        tw='cursor-pointer px-1'
                        style={{ border: '3px solid red' }}
                        onClick={() => (widget.value = !widget.value)}
                     >
                        click here
                     </div>
                     <div tw='ml-auto flex flex-nowrap'>
                        (default UI: 👉 <UY.boolean.default field={widget} /> 👈)
                     </div>
                  </div>
               ),
            },
         }),

         d: b.header('Custom string body:'),
         testD: b.string({
            body: ({ field: widget }) => <div>the string is {widget.value.length} char long.</div>,
         }),
      }),
   run: (ctx) => {},
})
