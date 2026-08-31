import { useState } from 'react'
import type { UploadFile } from '@expcat/tigercat-react'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'
import { Upload } from '@expcat/tigercat-react/Upload'

export default function App() {
  const [model, setModel] = useState<{ name: string; files: UploadFile[] }>({ name: '', files: [] })

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <Form model={model} onChange={setModel} labelPosition="top">
        <FormItem name="name" label="名称">
          <Input placeholder="请输入名称" />
        </FormItem>
        <FormItem name="files" label="附件">
          <Upload
            fileList={model.files}
            onChange={(_file, nextFiles) =>
              setModel((current) => ({ ...current, files: nextFiles }))
            }
          />
        </FormItem>
      </Form>
      <pre className="overflow-auto rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">
        {JSON.stringify(model, null, 2)}
      </pre>
    </div>
  )
}
