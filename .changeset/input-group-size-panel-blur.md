---
'@expcat/tigercat-react': patch
'@expcat/tigercat-vue': patch
---

Let DatePicker, Mentions, TimePicker, and TreeSelect inherit InputGroup size before falling back to md, while preserving explicit component sizes. Notify blur only once when focus leaves React DatePicker or TimePicker panels.
