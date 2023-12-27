# A image viewer for React Native created with Reanimated

### Features ✨

- ⚡ 120 FPS
- 🤏 Pinch to zoom
- 🤞 Double tap
- ✌️ Swipe-to-close
- 📦 Tiny
- 🚀 Created with Typescript
- 💅 Highly customizable

https://user-images.githubusercontent.com/63297375/210002857-2ab01afa-420a-40c9-9f4c-5df4c2a40a2b.mp4

### About 🗞️

Uses Reanimated and Gesture Handler under the hood. Created for my social network app, [Rybun](https://rybun.com)

### Installation ⚙️

```bash
yarn add react-native-reanimated-image-viewer
```

You will need [Reanimated](https://github.com/software-mansion/react-native-reanimated) and [Gesture Handler](https://github.com/software-mansion/react-native-gesture-handler) installed in your project

### Usage 🔨

Import the ImageViewer into a new screen. You can also use a Modal, but you will need to [configure the Gesture Handler on Android](https://docs.swmansion.com/react-native-gesture-handler/docs/next/installation#usage-with-modals-on-android)

### Example

```tsx
import React from "react";

import ImageViewer from "react-native-reanimated-image-viewer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const imageUrl = "https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=2726&h=2047&dpr=1"

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ImageViewer
        imageUrl={imageUrl} width={2726} height={2047} onRequestClose={() => {}}
      />
    </GestureHandlerRootView>
  );
}

```

### Props ✍️

| Property | Default | Type | Required
| ---- | ---- | ---- | ----
| `imageUrl` | `undefined` | `string` | `true`
| `width` | `undefined` | `number` | `true`
| `height` | `undefined` | `number` | `true`
| `onRequestClose` | `undefined` | `() => unknown` | `true`
| `onSingleTap` | `undefined` | `() => unknown` | `false`
