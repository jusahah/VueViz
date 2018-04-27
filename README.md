VueViz
=============

Vue 2 plugin that tracks the structure of your Vue component tree and color codes changes made to it.

To be used while developing your Vue app. Very light, no dependencies. Just install and go.

## Installation
---------------
### npm
``` sh
npm install --save vue-viz
```

## Usage
---------------

```vue
<script>
import vue from 'vue';
import App from './App'

// Import plugin
import VueViz from 'vue-viz';

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

## Example
---------------
to be inserted here


## Contributions
---------------
All contributions and ideas of further development are welcome. 
