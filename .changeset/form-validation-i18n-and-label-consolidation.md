---
'@expcat/tigercat-core': minor
'@expcat/tigercat-vue': minor
'@expcat/tigercat-react': minor
---

表单内置校验消息本地化与 i18n 标签整合（任务 A：A-1 / A-2 / A-3）

- **Form** 内置校验消息现可本地化：core 新增 `TigerLocaleFormValidation` 类型、`getFormValidationLabels` 及 `DEFAULT_FORM_VALIDATION_LABELS` / `ZH_CN_FORM_VALIDATION_LABELS`；`TigerLocale` 新增 `formValidation` 段（en-US / zh-CN 预设已补齐）。Vue/React `Form` 新增可选 `locale` prop 并接入 ConfigProvider locale，`<ConfigProvider locale={zhCN}>` 下必填/类型/范围等内置报错自动显示中文。单条规则 `message` 仍为最高优先级，默认英文行为不变。
- core 校验函数 `validateRule` / `validateField` / `validateForm` / `validateFormFields` 新增可选 `messages` 末参（默认英文），向后兼容。
- TimePicker / Upload 默认标签表收敛到 `locale-utils` 单一来源（新增 `DEFAULT_TIME_PICKER_LABELS` / `ZH_CN_TIME_PICKER_LABELS` / `DEFAULT_UPLOAD_LABELS`），消除分散重复；公共 `getTimePickerLabels` / `getUploadLabels` 签名不变。
- `shouldLoadMore` 撤销 `@deprecated` 标记：它是 InfiniteScroll 在 IntersectionObserver 不可用时的有意回退路径，并非待移除的废弃 API。
