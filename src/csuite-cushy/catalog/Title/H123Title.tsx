import { DefaultWidgetTitleUI, type WidgetTitleProps } from './WidgetLabelTextUI'

export const H1Title = (p: WidgetTitleProps): React.JSX.Element => <DefaultWidgetTitleUI as='h1' {...p} />
export const H2Title = (p: WidgetTitleProps): React.JSX.Element => <DefaultWidgetTitleUI as='h2' {...p} />
export const H3Title = (p: WidgetTitleProps): React.JSX.Element => <DefaultWidgetTitleUI as='h3' {...p} />
export const H4Title = (p: WidgetTitleProps): React.JSX.Element => <DefaultWidgetTitleUI as='h4' {...p} />
