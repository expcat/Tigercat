import { describe, it, expect } from 'vitest'
import { mount } from '@testing-library/vue'
import { expectNoA11yViolations } from '../utils/a11y-helpers'
import { Layout, Header, Footer, Sidebar, Content } from '@tigercat/vue'

describe('Layout Sections', () => {
  describe('Layout Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = mount(Layout, {
          slots: {
            default: () => 'Layout content',
          },
        })
        
        const layout = container.querySelector('.tiger-layout')
        expect(layout).toBeTruthy()
        expect(layout?.textContent).toBe('Layout content')
      })

      it('should render as a div element', () => {
        const { container } = mount(Layout, {
          slots: {
            default: () => 'Content',
          },
        })
        
        const layout = container.querySelector('.tiger-layout')
        expect(layout?.tagName).toBe('DIV')
      })
    })

    describe('Props', () => {
      it('should accept custom className', () => {
        const { container } = mount(Layout, {
          props: {
            className: 'custom-layout',
          },
          slots: {
            default: () => 'Content',
          },
        })
        
        const layout = container.querySelector('.tiger-layout')
        expect(layout?.classList.contains('custom-layout')).toBe(true)
      })
    })

    describe('Slots', () => {
      it('should render Header, Content, and Footer sections', () => {
        const { container } = mount(Layout, {
          slots: {
            default: () => [
              mount(Header, { slots: { default: () => 'Header' } }).html(),
              mount(Content, { slots: { default: () => 'Main content' } }).html(),
              mount(Footer, { slots: { default: () => 'Footer' } }).html(),
            ].join(''),
          },
        })
        
        expect(container.textContent).toContain('Header')
        expect(container.textContent).toContain('Main content')
        expect(container.textContent).toContain('Footer')
      })

      it('should render with Sidebar and Content', () => {
        const { container } = mount(Layout, {
          slots: {
            default: () => [
              mount(Sidebar, { slots: { default: () => 'Sidebar' } }).html(),
              mount(Content, { slots: { default: () => 'Main' } }).html(),
            ].join(''),
          },
        })
        
        expect(container.textContent).toContain('Sidebar')
        expect(container.textContent).toContain('Main')
      })
    })

    describe('Accessibility', () => {
      it('should have no accessibility violations', async () => {
        const { container } = mount(Layout, {
          slots: {
            default: () => 'Accessible layout',
          },
        })
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot', () => {
        const { container } = mount(Layout, {
          slots: {
            default: () => 'Layout content',
          },
        })
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })

  describe('Header Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = mount(Header, {
          slots: {
            default: () => 'Header content',
          },
        })
        
        const header = container.querySelector('.tiger-header')
        expect(header).toBeTruthy()
        expect(header?.textContent).toBe('Header content')
      })

      it('should render as a header element', () => {
        const { container } = mount(Header, {
          slots: {
            default: () => 'Content',
          },
        })
        
        const header = container.querySelector('.tiger-header')
        expect(header?.tagName).toBe('HEADER')
      })
    })

    describe('Props', () => {
      it('should apply default height', () => {
        const { container } = mount(Header, {
          slots: {
            default: () => 'Content',
          },
        })
        
        const header = container.querySelector('.tiger-header') as HTMLElement
        expect(header?.style.height).toBe('64px')
      })

      it('should accept custom height', () => {
        const { container } = mount(Header, {
          props: {
            height: '80px',
          },
          slots: {
            default: () => 'Content',
          },
        })
        
        const header = container.querySelector('.tiger-header') as HTMLElement
        expect(header?.style.height).toBe('80px')
      })

      it('should accept custom className', () => {
        const { container } = mount(Header, {
          props: {
            className: 'custom-header',
          },
          slots: {
            default: () => 'Content',
          },
        })
        
        const header = container.querySelector('.tiger-header')
        expect(header?.classList.contains('custom-header')).toBe(true)
      })
    })

    describe('Accessibility', () => {
      it('should use semantic header element', () => {
        const { container } = mount(Header, {
          slots: {
            default: () => 'Navigation',
          },
        })
        
        const header = container.querySelector('header')
        expect(header).toBeTruthy()
      })

      it('should have no accessibility violations', async () => {
        const { container } = mount(Header, {
          slots: {
            default: () => 'Site header',
          },
        })
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot with default height', () => {
        const { container } = mount(Header, {
          slots: {
            default: () => 'Header',
          },
        })
        
        expect(container.innerHTML).toMatchSnapshot()
      })

      it('should match snapshot with custom height', () => {
        const { container } = mount(Header, {
          props: {
            height: '100px',
          },
          slots: {
            default: () => 'Header',
          },
        })
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })

  describe('Footer Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = mount(Footer, {
          slots: {
            default: () => 'Footer content',
          },
        })
        
        const footer = container.querySelector('.tiger-footer')
        expect(footer).toBeTruthy()
        expect(footer?.textContent).toBe('Footer content')
      })

      it('should render as a footer element', () => {
        const { container } = mount(Footer, {
          slots: {
            default: () => 'Content',
          },
        })
        
        const footer = container.querySelector('.tiger-footer')
        expect(footer?.tagName).toBe('FOOTER')
      })
    })

    describe('Props', () => {
      it('should apply default height (auto)', () => {
        const { container } = mount(Footer, {
          slots: {
            default: () => 'Content',
          },
        })
        
        const footer = container.querySelector('.tiger-footer') as HTMLElement
        expect(footer?.style.height).toBe('auto')
      })

      it('should accept custom height', () => {
        const { container } = mount(Footer, {
          props: {
            height: '60px',
          },
          slots: {
            default: () => 'Content',
          },
        })
        
        const footer = container.querySelector('.tiger-footer') as HTMLElement
        expect(footer?.style.height).toBe('60px')
      })

      it('should accept custom className', () => {
        const { container } = mount(Footer, {
          props: {
            className: 'custom-footer',
          },
          slots: {
            default: () => 'Content',
          },
        })
        
        const footer = container.querySelector('.tiger-footer')
        expect(footer?.classList.contains('custom-footer')).toBe(true)
      })
    })

    describe('Accessibility', () => {
      it('should use semantic footer element', () => {
        const { container } = mount(Footer, {
          slots: {
            default: () => 'Copyright info',
          },
        })
        
        const footer = container.querySelector('footer')
        expect(footer).toBeTruthy()
      })

      it('should have no accessibility violations', async () => {
        const { container } = mount(Footer, {
          slots: {
            default: () => 'Site footer',
          },
        })
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot with default height', () => {
        const { container } = mount(Footer, {
          slots: {
            default: () => 'Footer',
          },
        })
        
        expect(container.innerHTML).toMatchSnapshot()
      })

      it('should match snapshot with custom height', () => {
        const { container } = mount(Footer, {
          props: {
            height: '80px',
          },
          slots: {
            default: () => 'Footer',
          },
        })
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })

  describe('Sidebar Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = mount(Sidebar, {
          slots: {
            default: () => 'Sidebar content',
          },
        })
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar).toBeTruthy()
        expect(sidebar?.textContent).toBe('Sidebar content')
      })

      it('should render as an aside element', () => {
        const { container } = mount(Sidebar, {
          slots: {
            default: () => 'Content',
          },
        })
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar?.tagName).toBe('ASIDE')
      })
    })

    describe('Props', () => {
      it('should apply default width (256px)', () => {
        const { container } = mount(Sidebar, {
          slots: {
            default: () => 'Content',
          },
        })
        
        const sidebar = container.querySelector('.tiger-sidebar') as HTMLElement
        expect(sidebar?.style.width).toBe('256px')
        expect(sidebar?.style.minWidth).toBe('256px')
      })

      it('should accept custom width', () => {
        const { container } = mount(Sidebar, {
          props: {
            width: '300px',
          },
          slots: {
            default: () => 'Content',
          },
        })
        
        const sidebar = container.querySelector('.tiger-sidebar') as HTMLElement
        expect(sidebar?.style.width).toBe('300px')
        expect(sidebar?.style.minWidth).toBe('300px')
      })

      it('should collapse when collapsed prop is true', () => {
        const { container } = mount(Sidebar, {
          props: {
            collapsed: true,
          },
          slots: {
            default: () => 'Content',
          },
        })
        
        const sidebar = container.querySelector('.tiger-sidebar') as HTMLElement
        expect(sidebar?.style.width).toBe('0px')
        expect(sidebar?.style.minWidth).toBe('0px')
      })

      it('should hide content when collapsed', () => {
        const { container } = mount(Sidebar, {
          props: {
            collapsed: true,
          },
          slots: {
            default: () => 'Hidden content',
          },
        })
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar?.textContent).toBe('')
      })

      it('should accept custom className', () => {
        const { container } = mount(Sidebar, {
          props: {
            className: 'custom-sidebar',
          },
          slots: {
            default: () => 'Content',
          },
        })
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar?.classList.contains('custom-sidebar')).toBe(true)
      })
    })

    describe('States', () => {
      it('should show content when not collapsed', () => {
        const { container } = mount(Sidebar, {
          props: {
            collapsed: false,
          },
          slots: {
            default: () => 'Visible content',
          },
        })
        
        expect(container.textContent).toContain('Visible content')
      })

      it('should apply transition classes', () => {
        const { container } = mount(Sidebar, {
          slots: {
            default: () => 'Content',
          },
        })
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar?.classList.contains('transition-all')).toBe(true)
        expect(sidebar?.classList.contains('duration-300')).toBe(true)
      })
    })

    describe('Accessibility', () => {
      it('should use semantic aside element', () => {
        const { container } = mount(Sidebar, {
          slots: {
            default: () => 'Navigation',
          },
        })
        
        const aside = container.querySelector('aside')
        expect(aside).toBeTruthy()
      })

      it('should have no accessibility violations', async () => {
        const { container } = mount(Sidebar, {
          slots: {
            default: () => 'Sidebar navigation',
          },
        })
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot with default width', () => {
        const { container } = mount(Sidebar, {
          slots: {
            default: () => 'Sidebar',
          },
        })
        
        expect(container.innerHTML).toMatchSnapshot()
      })

      it('should match snapshot when collapsed', () => {
        const { container } = mount(Sidebar, {
          props: {
            collapsed: true,
          },
          slots: {
            default: () => 'Sidebar',
          },
        })
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })

  describe('Content Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = mount(Content, {
          slots: {
            default: () => 'Main content',
          },
        })
        
        const content = container.querySelector('.tiger-content')
        expect(content).toBeTruthy()
        expect(content?.textContent).toBe('Main content')
      })

      it('should render as a main element', () => {
        const { container } = mount(Content, {
          slots: {
            default: () => 'Content',
          },
        })
        
        const content = container.querySelector('.tiger-content')
        expect(content?.tagName).toBe('MAIN')
      })
    })

    describe('Props', () => {
      it('should accept custom className', () => {
        const { container } = mount(Content, {
          props: {
            className: 'custom-content',
          },
          slots: {
            default: () => 'Content',
          },
        })
        
        const content = container.querySelector('.tiger-content')
        expect(content?.classList.contains('custom-content')).toBe(true)
      })
    })

    describe('Accessibility', () => {
      it('should use semantic main element', () => {
        const { container } = mount(Content, {
          slots: {
            default: () => 'Main content',
          },
        })
        
        const main = container.querySelector('main')
        expect(main).toBeTruthy()
      })

      it('should have no accessibility violations', async () => {
        const { container } = mount(Content, {
          slots: {
            default: () => 'Page content',
          },
        })
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot', () => {
        const { container } = mount(Content, {
          slots: {
            default: () => 'Content',
          },
        })
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })
})
