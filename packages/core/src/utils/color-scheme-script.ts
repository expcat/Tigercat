/**
 * Blocking inline script for the first paint.
 * Sets light, dark, or system on `<html>` before hydration.
 * CSS variables already live in the built stylesheet. This script does not
 * write styles after load and does not call `document.write`.
 */

export interface ColorSchemeInitOptions {
  storageKey: string
  nonce?: string
  attribute?: string
}

export function colorSchemeInitScript(options: ColorSchemeInitOptions): string {
  const attribute = options.attribute ?? 'data-tiger-color-scheme'
  const nonce = options.nonce ? ` nonce="${options.nonce.replace(/"/g, '')}"` : ''
  const storageKey = JSON.stringify(options.storageKey)
  const attributeName = JSON.stringify(attribute)
  const body = `(function(){try{var k=${storageKey};var a=${attributeName};var stored=null;try{stored=localStorage.getItem(k);}catch(e){}var systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var mode=stored==='light'||stored==='dark'?stored:(systemDark?'dark':'light');var root=document.documentElement;if(stored==='light'||stored==='dark'){root.setAttribute(a,stored);}else{root.setAttribute(a,'system');}root.classList.toggle('dark',mode==='dark');root.style.colorScheme=mode;}catch(e){}})();`
  return `<script${nonce}>${body}</script>`
}
