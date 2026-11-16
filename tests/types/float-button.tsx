import { createRef, type ComponentRef } from 'react'
import { FloatButton } from '../../packages/react/src/components/FloatButton'

const anchor: ComponentRef<typeof FloatButton> = document.createElement('a')
const ref = createRef<HTMLButtonElement | HTMLAnchorElement>()

export const linkedFloatButton = <FloatButton href="/inbox" ref={ref} />
export const floatButtonClick = (
  <FloatButton
    href="/inbox"
    onClick={(event) => {
      const target: HTMLButtonElement | HTMLAnchorElement = event.currentTarget
      // @ts-expect-error Links can expose an anchor instead of a button.
      const button: HTMLButtonElement = event.currentTarget
      void target
      void button
    }}
  />
)

void anchor
