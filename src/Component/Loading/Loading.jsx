import React from 'react'

const Loading = () => {
  return (
    <div>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    </div>
  )
}

export default Loading
