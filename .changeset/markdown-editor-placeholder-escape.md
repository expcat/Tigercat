---
'@expcat/tigercat-react': patch
'@expcat/tigercat-vue': patch
---

修复 `MarkdownEditor` 空预览态把 `placeholder` 直接写入 `innerHTML` 导致的 XSS 风险：空态占位文案现作为转义文本节点渲染，不再走 HTML 注入路径；非空预览仍经 `sanitizeHtml` 清洗，无公开 API 变更。
