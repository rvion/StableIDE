import type { RevealContentProps } from '../shells/ShellProps'

import { observer } from 'mobx-react-lite'

import { Button } from '../../button/Button'
import { Frame, type FrameProps } from '../../frame/Frame'
import { simpleFactory } from '../../SimpleFactory'
import { RevealUI } from '../RevealUI'

export const RevealTestUI = observer(function RevealTestUI_(p: {}) {
   const anchor = (where: string, props?: FrameProps): React.JSX.Element => (
      <Button expand {...props}>
         {where}
      </Button>
   )

   const conf = simpleFactory.useLocalstorage('18nnMJ5aY', (ui) =>
      ui.fields({
         trigger: ui.selectOneString(['hover', 'click', 'clickAndHover'], { default: 'hover' }),
         width: ui.pixel({ default: 200, step: 50 }),
         height: ui.pixel({ default: 120, step: 50 }),
         defaultVisible: ui.bool({ default: false }),
      }),
   )

   const Content2 = observer(
      (p: { content: () => string }): React.JSX.Element => (
         <pre //
            style={{
               width: `${conf.value.width}px`,
               height: `${conf.value.height}px`,
            }}
            tw='bg-blue-500 text-black'
         >
            ({p.content()})
         </pre>
      ),
   )
   const Content = (p: RevealContentProps): React.JSX.Element => (
      <Content2 content={() => /* JSON.stringify(p.reveal.pos, null, 3) */ '🟢'} />
   )

   const NotForwardingProps: React.FC = () => anchor('NOT FORWARDING PROPS')

   return (
      <div tw='flex flex-1 flex-col gap-2'>
         <Frame border base>
            {conf.UI()}
         </Frame>
         {conf.value.defaultVisible && (
            <RevealUI
               trigger='click'
               placement='bottomStart'
               content={Content}
               defaultVisible={conf.value.defaultVisible}
            >
               {anchor('defaultVisible')}
            </RevealUI>
         )}
         {/* AUTO -------------------------- */}
         {/* <Frame border base={5} tw='relative' style={{ height: '200px' }}>
                <RevealUI trigger={conf.value.trigger} placement='auto' tw='absolute top-8 left-8' content={Content}>
                    {anchor('auto')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger} placement='auto' tw='absolute bottom-8 right-8' content={Content}>
                    {anchor('auto')}
                </RevealUI>
            </Frame> */}
         {/* AUTO -------------------------- */}
         <div tw='m-8 grid grid-cols-5 gap-1'>
            {/* top ---------------------------------------------- */}
            <div></div>
            <RevealUI trigger={conf.value.trigger} placement='topStart' content={Content}>
               {anchor('topStart')}
            </RevealUI>
            <RevealUI trigger={conf.value.trigger} placement='top' content={Content}>
               {anchor('top')}
            </RevealUI>
            <RevealUI trigger={conf.value.trigger} placement='topEnd' content={Content}>
               {anchor('topEnd')}
            </RevealUI>
            <div></div>

            {/* ---------------------------------------------- */}
            <RevealUI trigger={conf.value.trigger} placement='leftStart' content={Content}>
               {anchor('leftStart')}
            </RevealUI>
            <div></div>
            <div></div>
            <div></div>
            <RevealUI trigger={conf.value.trigger} placement='rightStart' content={Content}>
               {anchor('rightStart')}
            </RevealUI>
            {/* ---------------------------------------------- */}
            <RevealUI trigger={conf.value.trigger} placement='left' content={Content}>
               {anchor('left')}
            </RevealUI>
            <RevealUI
               //
               trigger={conf.value.trigger}
               relativeTo='#bar'
               placement='above'
               shell='popup-lg'
               content={Content}
            >
               {anchor('#bar in popup', { base: { hueShift: 100, contrast: 0.1 } })}
            </RevealUI>
            <RevealUI trigger={conf.value.trigger} relativeTo='#foo' placement='above' content={Content}>
               {anchor('#foo', { base: { hueShift: 130, contrast: 0.1 } })}
            </RevealUI>
            <RevealUI trigger={conf.value.trigger} relativeTo='#bar' placement='above' content={Content}>
               {anchor('#bar', { base: { hueShift: 160, contrast: 0.1 } })}
            </RevealUI>

            <RevealUI trigger={conf.value.trigger} placement='right' content={Content}>
               {anchor('right')}
            </RevealUI>
            {/* ---------------------------------------------- */}
            <RevealUI trigger={conf.value.trigger} placement='leftEnd' content={Content}>
               {anchor('leftEnd')}
            </RevealUI>
            <RevealUI trigger={conf.value.trigger} shell='popup-sm' placement='screen-top' content={Content}>
               {anchor('popup-sm')}
            </RevealUI>
            <RevealUI trigger={conf.value.trigger} shell='popup-lg' placement='screen-top' content={Content}>
               {anchor('popup-lg')}
            </RevealUI>
            <div></div>
            <RevealUI trigger={conf.value.trigger} placement='rightEnd' content={Content}>
               {anchor('rightEnd')}
            </RevealUI>
            {/* ---------------------------------------------- */}
            {/* bottom */}
            <div></div>
            <RevealUI trigger={conf.value.trigger} placement='bottomStart' content={Content}>
               {anchor('bottomStart')}
            </RevealUI>
            <RevealUI trigger={conf.value.trigger} placement='bottom' content={Content}>
               {anchor('bottom')}
            </RevealUI>
            <RevealUI trigger={conf.value.trigger} placement='bottomEnd' content={Content}>
               {anchor('bottomEnd')}
            </RevealUI>
            <div></div>
         </div>
         <RevealUI trigger={conf.value.trigger} placement='topStart' content={Content}>
            <NotForwardingProps />
         </RevealUI>
         <Frame row>
            <RevealUI trigger={conf.value.trigger} placement='top' content={Content}>
               {anchor('focusable 1', { tabIndex: 0 })}
            </RevealUI>
            <RevealUI trigger={conf.value.trigger} placement='top' content={Content}>
               {anchor('focusable 2', { tabIndex: 0 })}
            </RevealUI>
         </Frame>

         <Frame row tw='py-12'>
            <button>Button 1</button>
            <button>Button 2</button>
            <RevealUI
               hideTriggers={{ blurAnchor: true }}
               trigger={'pseudofocus'}
               placement='top'
               content={Content}
            >
               {anchor('hide on blurAnchor', { tabIndex: 0 })}
            </RevealUI>
            <RevealUI
               hideTriggers={{ backdropClick: true }}
               trigger={'pseudofocus'}
               placement='top'
               content={Content}
            >
               {anchor('hide on backdropClick only', { tabIndex: 0 })}
            </RevealUI>
            <RevealUI
               hideTriggers={{ shellClick: true }}
               trigger={'pseudofocus'}
               placement='top'
               content={Content}
            >
               {anchor('hide on shellClick only', { tabIndex: 0 })}
            </RevealUI>
            <button>Button 3</button>
            <button>Button 4</button>
         </Frame>
         <Frame id='foo' base={{ hueShift: 100, contrast: 0.1 }} style={{ height: '150px' }}>
            #foo
         </Frame>
         <Frame id='bar' base={{ hueShift: 200, contrast: 0.1 }} style={{ height: '150px' }}>
            #bar
         </Frame>
         <RevealUI trigger={conf.value.trigger} placement='topStart' content={Content}>
            Text only
         </RevealUI>
         <RevealUI //
            trigger='click'
            shell='none'
            relativeTo='mouse'
            content={Content}
            tw='h-32 w-32 bg-orange-300'
         >
            Mouse
         </RevealUI>
      </div>
   )
})
