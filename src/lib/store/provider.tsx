'use client'

import { Provider } from 'react-redux'
import { useRef } from 'react'
import { AppStore, makeStore } from '@/lib/store'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // useRefの引数にnullを渡す
  const storeRef = useRef<AppStore | null>(null)
  
  if (!storeRef.current) {
    // コンポーネントが初回レンダリングされるときにストアインスタンスを作成
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}