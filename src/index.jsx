import React, { useEffect, useRef } from 'react'

const Vis3 = (props) => {
  const { domainName, ID, autoplay, size, onLoad } = props

  // One id per mounted component, generated during render so the div already carries it
  // on the first paint: the embed script resolves its container by id as soon as it runs.
  const containerIDRef = useRef(null)
  if (containerIDRef.current === null) {
    containerIDRef.current = Math.random().toString(36).substring(2)
  }
  const containerID = containerIDRef.current

  // Held in a ref so that a caller passing an inline arrow function does not count as a
  // changed dependency, which would tear the player down and rebuild it on every render.
  const onLoadRef = useRef(onLoad)
  onLoadRef.current = onLoad

  const apiRef = useRef(null)
  const unmountedRef = useRef(false)

  useEffect(() => {
    unmountedRef.current = false
    apiRef.current = null

    const callbackName = `vis_callback_${containerID}`

    // Registered whether or not the caller passed onLoad: this callback is the only
    // handle we ever get on the player, and tearing it down later depends on having it.
    window[callbackName] = (result, vis) => {
      if (unmountedRef.current) {
        // Unmounted while the embed was still loading. The player has just been built
        // into a container that is no longer on the page, so take it straight back down.
        result && result.api && result.api.actions.Destroy && result.api.actions.Destroy()
        return
      }

      apiRef.current = result && result.api

      if (typeof onLoadRef.current === 'function') {
        onLoadRef.current(result, vis)
      }
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://${domainName || ''}/${ID || ''}/embed?container=${containerID}&callback=${callbackName}${autoplay ? '&autoplay=true' : ''}${size ? `&size=${size}` : ''}`

    document.body.appendChild(script)

    return () => {
      unmountedRef.current = true

      // Removing the script tag frees nothing — it has already run, and the player it
      // built lives on in window.Vis. Without Destroy() hls.js keeps filling its buffer,
      // so the fragments of a video the viewer has navigated away from keep downloading.
      apiRef.current && apiRef.current.actions.Destroy && apiRef.current.actions.Destroy()
      apiRef.current = null

      script.remove()
      delete window[callbackName]
    }
    // Deliberately not [props]: that object is a new identity on every render of the
    // parent, which rebuilt the player each time instead of leaving it alone.
  }, [domainName, ID, autoplay, size, containerID])

  return <div id={containerID}></div>
}

export { Vis3 }
