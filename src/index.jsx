import React, { useState, useEffect } from 'react'

const Vis3 = (props) => {
  // State to store the container ID
  const [containerID, setContainerID] = useState('')

  useEffect(() => {
    // Generate a unique ID for the container
    const generatedID = Math.random().toString(36).substring(2)
    setContainerID(generatedID)

    // If a callback function is provided, set it on the window object
    if (typeof props.onLoad === 'function') {
      window[`vis_callback_${generatedID}`] = props.onLoad
    }

    // Create a script element and set its attributes
    const script = document.createElement('script')
    script.async = true
    script.src = `https://${props?.domainName || ''}/${props?.ID || ''}/embed?container=${generatedID}&callback=vis_callback_${generatedID}${props?.autoplay ? '&autoplay=true' : ''}${props?.size ? `&size=${props.size}` : ''}`

    // Append the script to the document body
    document.body.appendChild(script)

    // Cleanup function to remove the script element when the component unmounts or props change
    return () => {
      document.body.removeChild(script)
      // Remove the callback function from the window object
      if (typeof props.onLoad === 'function') {
        delete window[`vis_callback_${generatedID}`]
      }
    }
  }, [props]) // Run this effect whenever props change

  return (
    <>
      <div id={containerID}></div>
    </>
  )
}

export { Vis3 }