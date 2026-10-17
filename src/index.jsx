import React, { useState, useEffect, useRef } from 'react'

const Vis3 = ({ domainName, ID, autoplay, size, onLoad }) => {
  // Set after mount, not during render: a render-time id differs between the server HTML
  // and hydration, React keeps the server's, and the embed would never find its div.
  const [containerID, setContainerID] = useState('')
  useEffect(() => {
    setContainerID(Math.random().toString(36).substring(2))
  }, [])

  // A ref, so an inline onLoad does not rebuild the player on every parent render
  const onLoadRef = useRef(onLoad)
  onLoadRef.current = onLoad

  useEffect(() => {
    if (!containerID) return

    const callback = `vis_callback_${containerID}`
    let api = null
    let cancelled = false

    window[callback] = (result, vis) => {
      if (cancelled) {
        // Unmounted while the embed was still loading
        delete window[callback]
        return result.api.actions.Destroy?.()
      }
      api = result.api
      onLoadRef.current?.(result, vis)
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://${domainName || ''}/${ID || ''}/embed?container=${containerID}&callback=${callback}${autoplay ? '&autoplay=true' : ''}${size ? `&size=${size}` : ''}`
    document.body.appendChild(script)

    return () => {
      cancelled = true
      script.remove()
      if (!api) return
      // Removing the script frees nothing: the player it built lives on in window.Vis
      api.actions.Destroy?.()
      delete window[callback]
    }
  }, [containerID, domainName, ID, autoplay, size])

  return <div id={containerID}></div>
}

export { Vis3 }
