import { useEffect, useReducer, useRef } from 'react'
import {
  createFormEngine,
  getFormValidationLabels,
  type FormController,
  type FormControllerOptions,
  type FormEngine
} from '@expcat/tigercat-core'

/**
 * Headless form controller. The same engine `<Form>` uses.
 *
 * Pass the return value to `<Form controller={ctrl}>` so hook writes and
 * Form validation share one store. `Form.resetFields()` is `ctrl.reset()`.
 */
export function useFormController(options: FormControllerOptions = {}): FormController {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const engineRef = useRef<FormEngine | null>(null)
  if (engineRef.current === null) {
    engineRef.current = createFormEngine({
      initialValues: options.initialValues,
      undoable: options.undoable,
      maxHistorySize: options.maxHistorySize,
      getRules: () => optionsRef.current.rules,
      getConditions: () => optionsRef.current.conditions,
      getFieldDependencies: () => optionsRef.current.fieldDependencies,
      getMessages: () => getFormValidationLabels(optionsRef.current.locale),
      getValidateDebounce: () => optionsRef.current.validateDebounce ?? 0
    })
  }

  const [, rerender] = useReducer((count: number) => count + 1, 0)

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return undefined
    const unsubscribe = engine.subscribe(rerender)
    return () => {
      unsubscribe()
      engine.dispose()
    }
  }, [])

  return engineRef.current
}
