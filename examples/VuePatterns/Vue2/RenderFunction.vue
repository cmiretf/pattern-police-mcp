
<template>
  <div>
    <!-- Component uses render function instead -->
  </div>
</template>

<script>
export default {
  name: 'RenderFunction',
  
  props: {
    level: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  
  render(createElement) {
    return createElement(
      'h' + this.level,
      {
        attrs: {
          id: this.title.toLowerCase().replace(/\s/g, '-')
        },
        class: 'dynamic-heading'
      },
      [
        createElement('a', {
          attrs: {
            href: '#' + this.title.toLowerCase().replace(/\s/g, '-')
          }
        }, this.title)
      ]
    );
  }
};
</script>

<style scoped>
.dynamic-heading {
  color: #42b983;
}
</style>
