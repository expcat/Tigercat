/**
 * Kanban — thin wrapper around TaskBoard with Kanban-friendly defaults.
 *
 * Differences from TaskBoard defaults:
 *   showCardCount  = true  (TaskBoard default: false)
 *   allowAddCard   = true  (TaskBoard default: false)
 *
 * Swimlanes group cards inside each column by `swimlaneField`.
 * All events and slots fall through to TaskBoard; this wrapper does not
 * keep a second column state machine.
 */
import { defineComponent, h } from 'vue'
import { TaskBoard, type VueTaskBoardProps } from './TaskBoard'

export type VueKanbanProps = VueTaskBoardProps

export const Kanban = defineComponent({
  name: 'TigerKanban',
  inheritAttrs: false,
  props: {
    showCardCount: { type: Boolean, default: true },
    allowAddCard: { type: Boolean, default: true }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        TaskBoard,
        {
          ...attrs,
          showCardCount: props.showCardCount,
          allowAddCard: props.allowAddCard
        },
        slots
      )
  }
})

export default Kanban
