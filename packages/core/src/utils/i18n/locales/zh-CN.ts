/**
 * Simplified Chinese (zh-CN).
 */

import type { TigerLocale } from '../../../types/locale'

export const zhCN: TigerLocale = {
  locale: 'zh-CN',
  direction: 'ltr',
  common: {
    okText: '确定',
    cancelText: '取消',
    closeText: '关闭',
    loadingText: '加载中...',
    emptyText: '暂无数据',
    noMoreText: '没有更多了',
    searchPlaceholder: '搜索',
    clearText: '清除'
  },
  modal: {
    closeAriaLabel: '关闭',
    okText: '确定',
    cancelText: '取消'
  },
  drawer: {
    closeAriaLabel: '关闭'
  },
  pagination: {
    totalText: '共 {total} 条',
    itemsPerPageText: '条/页',
    jumpToText: '跳至',
    pageText: '页',
    prevPageAriaLabel: '上一页',
    nextPageAriaLabel: '下一页',
    pageAriaLabel: '第 {page} 页',
    pageIndicatorText: '第 {current} 页，共 {total} 页'
  },
  table: {
    emptyText: '暂无数据',
    loadingText: '加载中',
    expandText: '展开',
    collapseText: '收起',
    selectAllText: '全选',
    selectRowAriaLabel: '选择第 {row} 行',
    sortByText: '按 {column} 排序',
    clearSortText: '不排序',
    toolbarAriaLabel: '数据表格工具栏',
    searchPlaceholder: '搜索',
    searchButtonText: '搜索',
    selectedText: '已选择',
    selectedItemsText: '项',
    columnSettingsText: '列设置',
    columnSettingsAriaLabel: '列设置',
    lockColumnAriaLabel: '锁定{column}列',
    unlockColumnAriaLabel: '取消锁定{column}列'
  },
  formWizard: {
    prevText: '上一步',
    nextText: '下一步',
    finishText: '完成'
  },
  taskBoard: {
    emptyColumnText: '暂无任务',
    addCardText: '添加任务',
    wipLimitText: 'WIP 限制: {limit}',
    dragHintText: '拖拽以移动',
    boardAriaLabel: '任务看板'
  },
  formValidation: {
    required: '此字段为必填项',
    typeString: '值必须是字符串',
    typeNumber: '值必须是数字',
    typeBoolean: '值必须是布尔值',
    typeArray: '值必须是数组',
    typeObject: '值必须是对象',
    email: '请输入有效的邮箱地址',
    phone: '请输入有效的电话号码',
    url: '请输入有效的网址',
    date: '请输入有效的日期',
    idCard: '请输入有效的身份证号码',
    minLength: '长度不能少于 {min} 个字符',
    maxLength: '长度不能超过 {max} 个字符',
    minValue: '数值不能小于 {min}',
    maxValue: '数值不能大于 {max}',
    minItems: '至少需要 {min} 项',
    maxItems: '最多允许 {max} 项',
    patternMismatch: '格式不正确',
    validatorFailed: '校验未通过',
    validatorError: '校验时发生错误'
  }
}
