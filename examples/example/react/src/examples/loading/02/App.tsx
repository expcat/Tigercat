import { Button } from '@expcat/tigercat-react/Button'
import { Card } from '@expcat/tigercat-react/Card'
import { useState } from 'react'
import { Loading } from '@expcat/tigercat-react/Loading'

export default function App() {
  const [pageLoading, setPageLoading] = useState(false)

  const [cardLoading, setCardLoading] = useState(false)

  const [buttonLoading, setButtonLoading] = useState(false)

  const showPageLoading = () => {
    setPageLoading(true)
    setTimeout(() => {
      setPageLoading(false)
    }, 2000)
  }

  const refreshCard = () => {
    setCardLoading(true)
    setTimeout(() => {
      setCardLoading(false)
    }, 1500)
  }

  const handleSubmit = () => {
    setButtonLoading(true)
    setTimeout(() => {
      setButtonLoading(false)
    }, 2000)
  }

  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Button onClick={showPageLoading}>显示全屏加载</Button>
        {pageLoading && <Loading fullscreen text="页面加载中..." />}
      </div>
    </>
  )
}
