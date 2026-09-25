/**
 * Layers portaled into a parent document outlive the iframe that created them.
 * Route changes discard the demo frame without running Vue/React unmount, so the
 * moved nodes must be removed from the owner window as well as from the frame.
 */

const layersByFrame = new Map<HTMLElement, Set<HTMLElement>>()
let frameObserver: MutationObserver | null = null
let observedDocument: Document | null = null

function ownerFrame(view: Window): HTMLElement | null {
  try {
    const frame = view.frameElement
    if (!frame || frame.nodeType !== 1 || !view.parent || view.parent === view) return null
    void view.parent.document
    return frame as HTMLElement
  } catch {
    return null
  }
}

function stopFrameObserver(): void {
  frameObserver?.disconnect()
  frameObserver = null
  observedDocument = null
}

function sweepDisconnectedFrames(): void {
  for (const [frame, layers] of layersByFrame) {
    if (frame.isConnected) continue
    for (const layer of layers) layer.remove()
    layersByFrame.delete(frame)
  }
  if (layersByFrame.size === 0) stopFrameObserver()
}

function watchFrame(frame: HTMLElement): void {
  const doc = frame.ownerDocument
  if (frameObserver && observedDocument === doc) return
  stopFrameObserver()
  const View = doc.defaultView
  if (!View) return
  observedDocument = doc
  frameObserver = new View.MutationObserver(() => {
    sweepDisconnectedFrames()
  })
  frameObserver.observe(doc.documentElement, { childList: true, subtree: true })
}

/**
 * Keep a portaled layer mounted only while its creating window is alive.
 * Returns a release for a normal component unmount; the layer node itself is
 * left for the framework to remove in that case.
 */
export function retainPortaledOverlay(layer: HTMLElement, ownerView: Window = window): () => void {
  const frame = ownerFrame(ownerView)
  let released = false

  const onPageHide = () => {
    layer.remove()
    release()
  }

  ownerView.addEventListener('pagehide', onPageHide)

  if (frame) {
    let layers = layersByFrame.get(frame)
    if (!layers) {
      layers = new Set()
      layersByFrame.set(frame, layers)
    }
    layers.add(layer)
    watchFrame(frame)
  }

  function release(): void {
    if (released) return
    released = true
    try {
      ownerView.removeEventListener('pagehide', onPageHide)
    } catch {
      // The owner window can already be discarded.
    }
    if (!frame) return
    const layers = layersByFrame.get(frame)
    layers?.delete(layer)
    if (layers && layers.size === 0) layersByFrame.delete(frame)
    if (layersByFrame.size === 0) stopFrameObserver()
  }

  return release
}
