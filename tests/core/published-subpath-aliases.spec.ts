import { describe, expect, it } from 'vitest'
import { useFullscreen } from '@expcat/tigercat-react/useFullscreen'
import { notification as reactNotification } from '@expcat/tigercat-react/notification'
import { notification as vueNotification } from '@expcat/tigercat-vue/notification'

describe('published subpath aliases', () => {
  it('loads React useFullscreen and both notification roots from source', () => {
    expect(typeof useFullscreen).toBe('function')
    expect(typeof reactNotification.info).toBe('function')
    expect(typeof vueNotification.info).toBe('function')
  })
})
