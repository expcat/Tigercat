import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { expectNoA11yViolations } from '../utils/a11y-helpers'
import { Layout, Header, Footer, Sidebar, Content } from '@tigercat/react'
import React from 'react'

describe('Layout Sections', () => {
  describe('Layout Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = render(<Layout>Layout content</Layout>)
        
        const layout = container.querySelector('.tiger-layout')
        expect(layout).toBeTruthy()
        expect(layout?.textContent).toBe('Layout content')
      })

      it('should render as a div element', () => {
        const { container } = render(<Layout>Content</Layout>)
        
        const layout = container.querySelector('.tiger-layout')
        expect(layout?.tagName).toBe('DIV')
      })

      it('should render children', () => {
        const { getByText } = render(
          <Layout>
            <div>Child content</div>
          </Layout>
        )
        
        expect(getByText('Child content')).toBeTruthy()
      })
    })

    describe('Props', () => {
      it('should accept custom className', () => {
        const { container } = render(
          <Layout className="custom-layout">Content</Layout>
        )
        
        const layout = container.querySelector('.tiger-layout')
        expect(layout?.classList.contains('custom-layout')).toBe(true)
      })
    })

    describe('Children', () => {
      it('should render Header, Content, and Footer sections', () => {
        const { container } = render(
          <Layout>
            <Header>Header</Header>
            <Content>Main content</Content>
            <Footer>Footer</Footer>
          </Layout>
        )
        
        expect(container.textContent).toContain('Header')
        expect(container.textContent).toContain('Main content')
        expect(container.textContent).toContain('Footer')
      })

      it('should render with Sidebar and Content', () => {
        const { container } = render(
          <Layout>
            <Sidebar>Sidebar</Sidebar>
            <Content>Main</Content>
          </Layout>
        )
        
        expect(container.textContent).toContain('Sidebar')
        expect(container.textContent).toContain('Main')
      })

      it('should render multiple children', () => {
        const { getByText } = render(
          <Layout>
            <div>First</div>
            <div>Second</div>
            <div>Third</div>
          </Layout>
        )
        
        expect(getByText('First')).toBeTruthy()
        expect(getByText('Second')).toBeTruthy()
        expect(getByText('Third')).toBeTruthy()
      })
    })

    describe('Accessibility', () => {
      it('should have no accessibility violations', async () => {
        const { container } = render(<Layout>Accessible layout</Layout>)
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot', () => {
        const { container } = render(<Layout>Layout content</Layout>)
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })

  describe('Header Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = render(<Header>Header content</Header>)
        
        const header = container.querySelector('.tiger-header')
        expect(header).toBeTruthy()
        expect(header?.textContent).toBe('Header content')
      })

      it('should render as a header element', () => {
        const { container } = render(<Header>Content</Header>)
        
        const header = container.querySelector('.tiger-header')
        expect(header?.tagName).toBe('HEADER')
      })

      it('should render children', () => {
        const { getByText } = render(
          <Header>
            <div>Navigation</div>
          </Header>
        )
        
        expect(getByText('Navigation')).toBeTruthy()
      })
    })

    describe('Props', () => {
      it('should apply default height', () => {
        const { container } = render(<Header>Content</Header>)
        
        const header = container.querySelector('.tiger-header') as HTMLElement
        expect(header?.style.height).toBe('64px')
      })

      it('should accept custom height', () => {
        const { container } = render(<Header height="80px">Content</Header>)
        
        const header = container.querySelector('.tiger-header') as HTMLElement
        expect(header?.style.height).toBe('80px')
      })

      it('should accept custom className', () => {
        const { container } = render(
          <Header className="custom-header">Content</Header>
        )
        
        const header = container.querySelector('.tiger-header')
        expect(header?.classList.contains('custom-header')).toBe(true)
      })
    })

    describe('Children', () => {
      it('should render multiple children', () => {
        const { getByText } = render(
          <Header>
            <div>Logo</div>
            <div>Nav</div>
          </Header>
        )
        
        expect(getByText('Logo')).toBeTruthy()
        expect(getByText('Nav')).toBeTruthy()
      })
    })

    describe('Accessibility', () => {
      it('should use semantic header element', () => {
        const { container } = render(<Header>Navigation</Header>)
        
        const header = container.querySelector('header')
        expect(header).toBeTruthy()
      })

      it('should have no accessibility violations', async () => {
        const { container } = render(<Header>Site header</Header>)
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot with default height', () => {
        const { container } = render(<Header>Header</Header>)
        
        expect(container.innerHTML).toMatchSnapshot()
      })

      it('should match snapshot with custom height', () => {
        const { container } = render(<Header height="100px">Header</Header>)
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })

  describe('Footer Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = render(<Footer>Footer content</Footer>)
        
        const footer = container.querySelector('.tiger-footer')
        expect(footer).toBeTruthy()
        expect(footer?.textContent).toBe('Footer content')
      })

      it('should render as a footer element', () => {
        const { container } = render(<Footer>Content</Footer>)
        
        const footer = container.querySelector('.tiger-footer')
        expect(footer?.tagName).toBe('FOOTER')
      })

      it('should render children', () => {
        const { getByText } = render(
          <Footer>
            <div>Copyright</div>
          </Footer>
        )
        
        expect(getByText('Copyright')).toBeTruthy()
      })
    })

    describe('Props', () => {
      it('should apply default height (auto)', () => {
        const { container } = render(<Footer>Content</Footer>)
        
        const footer = container.querySelector('.tiger-footer') as HTMLElement
        expect(footer?.style.height).toBe('auto')
      })

      it('should accept custom height', () => {
        const { container } = render(<Footer height="60px">Content</Footer>)
        
        const footer = container.querySelector('.tiger-footer') as HTMLElement
        expect(footer?.style.height).toBe('60px')
      })

      it('should accept custom className', () => {
        const { container } = render(
          <Footer className="custom-footer">Content</Footer>
        )
        
        const footer = container.querySelector('.tiger-footer')
        expect(footer?.classList.contains('custom-footer')).toBe(true)
      })
    })

    describe('Children', () => {
      it('should render multiple children', () => {
        const { getByText } = render(
          <Footer>
            <div>Copyright</div>
            <div>Links</div>
          </Footer>
        )
        
        expect(getByText('Copyright')).toBeTruthy()
        expect(getByText('Links')).toBeTruthy()
      })
    })

    describe('Accessibility', () => {
      it('should use semantic footer element', () => {
        const { container } = render(<Footer>Copyright info</Footer>)
        
        const footer = container.querySelector('footer')
        expect(footer).toBeTruthy()
      })

      it('should have no accessibility violations', async () => {
        const { container } = render(<Footer>Site footer</Footer>)
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot with default height', () => {
        const { container } = render(<Footer>Footer</Footer>)
        
        expect(container.innerHTML).toMatchSnapshot()
      })

      it('should match snapshot with custom height', () => {
        const { container } = render(<Footer height="80px">Footer</Footer>)
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })

  describe('Sidebar Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = render(<Sidebar>Sidebar content</Sidebar>)
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar).toBeTruthy()
        expect(sidebar?.textContent).toBe('Sidebar content')
      })

      it('should render as an aside element', () => {
        const { container } = render(<Sidebar>Content</Sidebar>)
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar?.tagName).toBe('ASIDE')
      })

      it('should render children', () => {
        const { getByText } = render(
          <Sidebar>
            <div>Nav items</div>
          </Sidebar>
        )
        
        expect(getByText('Nav items')).toBeTruthy()
      })
    })

    describe('Props', () => {
      it('should apply default width (256px)', () => {
        const { container } = render(<Sidebar>Content</Sidebar>)
        
        const sidebar = container.querySelector('.tiger-sidebar') as HTMLElement
        expect(sidebar?.style.width).toBe('256px')
        expect(sidebar?.style.minWidth).toBe('256px')
      })

      it('should accept custom width', () => {
        const { container } = render(<Sidebar width="300px">Content</Sidebar>)
        
        const sidebar = container.querySelector('.tiger-sidebar') as HTMLElement
        expect(sidebar?.style.width).toBe('300px')
        expect(sidebar?.style.minWidth).toBe('300px')
      })

      it('should collapse when collapsed prop is true', () => {
        const { container } = render(<Sidebar collapsed>Content</Sidebar>)
        
        const sidebar = container.querySelector('.tiger-sidebar') as HTMLElement
        expect(sidebar?.style.width).toBe('0px')
        expect(sidebar?.style.minWidth).toBe('0px')
      })

      it('should hide content when collapsed', () => {
        const { container } = render(
          <Sidebar collapsed>Hidden content</Sidebar>
        )
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar?.textContent).toBe('')
      })

      it('should accept custom className', () => {
        const { container } = render(
          <Sidebar className="custom-sidebar">Content</Sidebar>
        )
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar?.classList.contains('custom-sidebar')).toBe(true)
      })
    })

    describe('States', () => {
      it('should show content when not collapsed', () => {
        const { container } = render(
          <Sidebar collapsed={false}>Visible content</Sidebar>
        )
        
        expect(container.textContent).toContain('Visible content')
      })

      it('should apply transition classes', () => {
        const { container } = render(<Sidebar>Content</Sidebar>)
        
        const sidebar = container.querySelector('.tiger-sidebar')
        expect(sidebar?.classList.contains('transition-all')).toBe(true)
        expect(sidebar?.classList.contains('duration-300')).toBe(true)
      })
    })

    describe('Children', () => {
      it('should render multiple children', () => {
        const { getByText } = render(
          <Sidebar>
            <div>Menu 1</div>
            <div>Menu 2</div>
          </Sidebar>
        )
        
        expect(getByText('Menu 1')).toBeTruthy()
        expect(getByText('Menu 2')).toBeTruthy()
      })
    })

    describe('Accessibility', () => {
      it('should use semantic aside element', () => {
        const { container } = render(<Sidebar>Navigation</Sidebar>)
        
        const aside = container.querySelector('aside')
        expect(aside).toBeTruthy()
      })

      it('should have no accessibility violations', async () => {
        const { container } = render(<Sidebar>Sidebar navigation</Sidebar>)
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot with default width', () => {
        const { container } = render(<Sidebar>Sidebar</Sidebar>)
        
        expect(container.innerHTML).toMatchSnapshot()
      })

      it('should match snapshot when collapsed', () => {
        const { container } = render(<Sidebar collapsed>Sidebar</Sidebar>)
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })

  describe('Content Component', () => {
    describe('Rendering', () => {
      it('should render with default props', () => {
        const { container } = render(<Content>Main content</Content>)
        
        const content = container.querySelector('.tiger-content')
        expect(content).toBeTruthy()
        expect(content?.textContent).toBe('Main content')
      })

      it('should render as a main element', () => {
        const { container } = render(<Content>Content</Content>)
        
        const content = container.querySelector('.tiger-content')
        expect(content?.tagName).toBe('MAIN')
      })

      it('should render children', () => {
        const { getByText } = render(
          <Content>
            <div>Page content</div>
          </Content>
        )
        
        expect(getByText('Page content')).toBeTruthy()
      })
    })

    describe('Props', () => {
      it('should accept custom className', () => {
        const { container } = render(
          <Content className="custom-content">Content</Content>
        )
        
        const content = container.querySelector('.tiger-content')
        expect(content?.classList.contains('custom-content')).toBe(true)
      })
    })

    describe('Children', () => {
      it('should render multiple children', () => {
        const { getByText } = render(
          <Content>
            <div>Section 1</div>
            <div>Section 2</div>
          </Content>
        )
        
        expect(getByText('Section 1')).toBeTruthy()
        expect(getByText('Section 2')).toBeTruthy()
      })

      it('should render complex children', () => {
        const { getByText } = render(
          <Content>
            <div>
              <h1>Title</h1>
              <p>Paragraph</p>
            </div>
          </Content>
        )
        
        expect(getByText('Title')).toBeTruthy()
        expect(getByText('Paragraph')).toBeTruthy()
      })
    })

    describe('Accessibility', () => {
      it('should use semantic main element', () => {
        const { container } = render(<Content>Main content</Content>)
        
        const main = container.querySelector('main')
        expect(main).toBeTruthy()
      })

      it('should have no accessibility violations', async () => {
        const { container } = render(<Content>Page content</Content>)
        
        await expectNoA11yViolations(container)
      })
    })

    describe('Snapshots', () => {
      it('should match snapshot', () => {
        const { container } = render(<Content>Content</Content>)
        
        expect(container.innerHTML).toMatchSnapshot()
      })
    })
  })
})
