'use client'

import { useEffect } from "react"

export default function CrispChat() {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
    if (!websiteId) return

    // 设置 Crisp 的 Website ID
    ;(window as any).$crisp = []
    ;(window as any).CRISP_WEBSITE_ID = websiteId

    // 加载 Crisp 的脚本
    const script = document.createElement("script")
    script.src = "https://client.crisp.chat/l.js"
    script.async = true
    document.head.appendChild(script)

    return () => {
      // 清理
      document.head.removeChild(script)
    }
  }, [])

  return null
}
