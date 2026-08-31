import { useState } from 'react'
import type { UploadFile } from '@expcat/tigercat-react'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Upload } from '@expcat/tigercat-react/Upload'

export default function App() {
  const [model, setModel] = useState<{ files: UploadFile[] }>({ files: [] })

  return (
    <Form model={model} onChange={setModel} labelPosition="top">
      <FormItem name="files" label="图片">
        <Upload
          fileList={model.files}
          onChange={(_file, nextFiles) => setModel({ files: nextFiles })}
          accept=".jpg,.jpeg,.png"
          maxSize={2 * 1024 * 1024}
          limit={3}
          multiple
          listType="picture"
        />
      </FormItem>
    </Form>
  )
}
