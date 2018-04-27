VueViz
=============

Vue 2 plugin that tracks the structure of your Vue component tree and color codes changes made to it.

To be used while developing your Vue app. Very light, no dependencies. Just install and go.

## Installation
---------------
### npm
``` sh
npm install --save vueviz
```

## Usage
---------------

```vue
<script>
import vue from 'vue';
import App from './App'

// Import plugin
import VueViz from 'vueviz';

// Use plugin
Vue.use(VueViz);

new Vue({
  name: 'My App',
  el: '#app',
  template: '<App/>',
  components: { App }
})
</script>

```

Left-top side of your screen gets few control buttons that allow you to control rendering of the component tree. By default control panel is minified; click "Viz" button to open it.

## Color codes
---------------

*Grey/black:* component is old (has been a part of the component tree for more than few seconds) and has not been refreshed lately.

*Green:* component is new (just inserted into component tree).

*Blue:* component is old, but was refreshed a moment ago.


## Example
---------------
to be inserted here


## Contributions
---------------
All contributions and ideas of further development are welcome. 
