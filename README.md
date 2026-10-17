# Vis3 for React & Next.js

Put the Kavimo Vis3 video player in a React or Next.js app with a single component.

- React 16, 17 and 18, and Next.js (App Router and Pages Router)
- Safe with server-side rendering
- Cleans up after itself: when the component unmounts, the player stops downloading and is removed


## Installation

```bash
npm install @kavimo-tehran/vis3-next-react
```

`react` and `react-dom` are peer dependencies: the component uses the ones your app already has.


## Quick start

```jsx
import { Vis3 } from '@kavimo-tehran/vis3-next-react'

export default function App() {
  return <Vis3 domainName="stream.domain.com" ID="xxxxxxxxxxxx" />
}
```

- `domainName` is your Kavimo stream domain, without `https://`
- `ID` is the ID of the video


## Examples

### React (Vite, Create React App, …)

```jsx
import { Vis3 } from '@kavimo-tehran/vis3-next-react'

function App() {
  return (
    <div className="App">
      <h1>My course</h1>
      <Vis3 domainName="stream.domain.com" ID="xxxxxxxxxxxx" />
    </div>
  )
}

export default App
```

### Next.js — App Router

The player runs in the browser, so use it in a Client Component (a file that starts with `'use client'`):

```jsx
// app/lesson/Player.jsx
'use client'
import { Vis3 } from '@kavimo-tehran/vis3-next-react'

export default function Player({ videoID }) {
  return <Vis3 domainName="stream.domain.com" ID={videoID} />
}
```

Then use that component from any page:

```jsx
// app/lesson/page.jsx
import Player from './Player'

export default function Page() {
  return (
    <main>
      <h1>Lesson 1</h1>
      <Player videoID="xxxxxxxxxxxx" />
    </main>
  )
}
```

### Next.js — Pages Router

```jsx
// pages/index.jsx
import { Vis3 } from '@kavimo-tehran/vis3-next-react'

export default function Home() {
  return <Vis3 domainName="stream.domain.com" ID="xxxxxxxxxxxx" />
}
```

### Autoplay

```jsx
<Vis3 domainName="stream.domain.com" ID="xxxxxxxxxxxx" autoplay={true} />
```

Browsers may block autoplay with sound until the viewer has interacted with the page.

### Player size

```jsx
// A preset
<Vis3 domainName="stream.domain.com" ID="xxxxxxxxxxxx" size="portrait" />

// A resolution
<Vis3 domainName="stream.domain.com" ID="xxxxxxxxxxxx" size="1280x720" />
```

### Control the player with your own buttons

Keep `media.api` from `onLoad`, then call it whenever you need:

```jsx
'use client'
import { useRef } from 'react'
import { Vis3 } from '@kavimo-tehran/vis3-next-react'

export default function Player() {
  const player = useRef(null)

  return (
    <>
      <Vis3
        domainName="stream.domain.com"
        ID="xxxxxxxxxxxx"
        onLoad={(media) => { player.current = media.api }}
      />

      <button onClick={() => player.current?.actions.Play()}>Play</button>
      <button onClick={() => player.current?.actions.Pause()}>Pause</button>
      <button onClick={() => player.current?.actions.Seek(60)}>Jump to 1:00</button>
    </>
  )
}
```

### Listen to playback events

```jsx
const handleLoad = (media) => {
  const api = media.api

  api.events.OnPlay(() => console.log('Playing'))
  api.events.OnPause(() => console.log('Paused'))
  api.events.OnEnded(() => console.log('Finished'))

  api.events.OnTimeupdate(() => {
    console.log('Now at second', api.get.CurrentTime())
  })
}

<Vis3 domainName="stream.domain.com" ID="xxxxxxxxxxxx" onLoad={handleLoad} />
```

### Save the viewer's progress

```jsx
const handleLoad = (media) => {
  const api = media.api

  api.events.OnEnded(() => {
    fetch('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ video: api.get.ID(), done: true }),
    })
  })
}
```

### Show another video

Just change `ID`. The old player is removed and the new one is built:

```jsx
'use client'
import { useState } from 'react'
import { Vis3 } from '@kavimo-tehran/vis3-next-react'

export default function Course() {
  const [videoID, setVideoID] = useState('xxxxxxxxxxxx')

  return (
    <>
      <Vis3 domainName="stream.domain.com" ID={videoID} />
      <button onClick={() => setVideoID('yyyyyyyyyyyy')}>Next lesson</button>
    </>
  )
}
```

### Watermark (DRM text)

Show the viewer's details over the video, so a screen recording can be traced back:

```jsx
const handleLoad = (media) => {
  media.api.DRMText({
    text: ['user@example.com', '09123456789'],
    time: '2.5',        // seconds between moves (optional)
    color: '#FFFFFF',   // (optional)
    fontSize: '13px',   // px or % (optional)
    fontStyle: 'bold',  // normal, bold or italic (optional)
    fontName: 'arial',  // (optional)
    opacity: '0.4',     // (optional)
  })
}
```


## Props

| Prop         | Type     | Required | Description                                                  |
| ------------ | -------- | -------- | ------------------------------------------------------------ |
| `domainName` | string   | Yes      | Your stream domain, e.g. `stream.domain.com`                 |
| `ID`         | string   | Yes      | The video ID. Change it to show another video                |
| `onLoad`     | function | No       | Called once the player is ready, with the `media` object     |
| `autoplay`   | boolean  | No       | Start playing as soon as the player is ready                 |
| `size`       | string   | No       | A preset like `"portrait"` or a resolution like `"1280x720"` |


## The `media` object

`onLoad` receives `media`. Everything you can do with the player is on `media.api`.

### `api.get`: read information

| Method              | Returns                            |
| ------------------- | ---------------------------------- |
| `get.ID()`          | The video ID                       |
| `get.Title()`       | The video title                    |
| `get.Duration()`    | Length, in seconds                 |
| `get.CurrentTime()` | Current position, in seconds       |

### `api.is`: check the state

| Method            | Returns                    |
| ----------------- | -------------------------- |
| `is.Play()`       | `true` while playing       |
| `is.Pause()`      | `true` while paused        |
| `is.Mute()`       | `true` while muted         |
| `is.Fullscreen()` | `true` while in fullscreen |

### `api.actions`: control playback

| Method                        | Does                                               |
| ----------------------------- | -------------------------------------------------- |
| `actions.Play()`              | Plays                                              |
| `actions.Pause()`             | Pauses                                             |
| `actions.Seek(seconds)`       | Jumps to a position                                |
| `actions.Forward(seconds)`    | Goes forward (5 seconds if you leave it out)       |
| `actions.Rewind(seconds)`     | Goes back (5 seconds if you leave it out)          |
| `actions.Destroy()`           | Removes the player and stops all its downloads     |

You don't need `Destroy()` with `<Vis3 />`: unmounting the component already does it.

### `api.events`: listen to playback

| Method                    | Your function runs when…                        |
| ------------------------- | ----------------------------------------------- |
| `events.OnPlay(fn)`       | Playback starts or resumes                      |
| `events.OnPause(fn)`      | Playback pauses                                 |
| `events.OnEnded(fn)`      | The video reaches the end                       |
| `events.OnTimeupdate(fn)` | The position changes; read `get.CurrentTime()`  |

### `api.DRMText(options)`: watermark

| Option      | Example                       | Description                         |
| ----------- | ----------------------------- | ----------------------------------- |
| `text`      | `['user@example.com']`        | Lines of text to show (required)    |
| `time`      | `'2.5'`                       | Seconds between moves               |
| `color`     | `'#FFFFFF'`                   | Text color                          |
| `fontSize`  | `'13px'`                      | Size in px or %                     |
| `fontStyle` | `'bold'`                      | `normal`, `bold` or `italic`        |
| `fontName`  | `'arial'`                     | Font family                         |
| `opacity`   | `'0.4'`                       | From `0` to `1`                     |


## Good to know

- **Unmounting** removes the player: it stops downloading and leaves nothing behind. No cleanup code is needed.
- **Server-side rendering**: the server renders an empty `<div>`, and the player is built in the browser.
- **Taken out of the page without unmounting** (its element is removed from the document and later put back): the player stops downloading while it is out and carries on when it comes back.


## Troubleshooting

| Problem                                                    | Fix                                                                   |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| Nothing shows up                                           | Check `domainName` (no `https://`, no trailing `/`) and `ID`          |
| Next.js: *"useState only works in Client Components"*      | Use `<Vis3 />` in a file that starts with `'use client'`              |
| Autoplay doesn't start                                     | The browser blocked it; it plays once the viewer clicks play         |
