<template>
  <div>
    <div v-for="item in items" v-if="item.active">
      {{ item.name }}
    </div>
    
    <ul>
      <li v-for="product in products">
        {{ product.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import { someMixin } from './mixins'

export default {
  mixins: [someMixin],
  
  props: {
    initialValue: Number
  },
  
  data() {
    return {
      count: 0,
      items: [],
      products: []
    }
  },
  
  methods: {
    increment() {
      this.initialValue++
    },
    
    accessParent() {
      this.$parent.someMethod()
      this.$root.globalData
    },
    
    veryLongMethod() {
      const result1 = this.someCalculation()
      const result2 = this.anotherCalculation()
      const result3 = this.moreCalculation()
      const result4 = this.evenMoreCalculation()
      const result5 = this.tooManyCalculations()
      const result6 = this.wayTooManyCalculations()
      const result7 = this.seriouslyTooManyCalculations()
      const result8 = this.okThisIsRidiculous()
      const result9 = this.whyIsThisStillGoing()
      const result10 = this.pleaseStop()
      const result11 = this.finallyDone()
      const result12 = this.justKidding()
      const result13 = this.moreLines()
      const result14 = this.evenMoreLines()
      const result15 = this.lotsOfLines()
      const result16 = this.tooManyLines()
      const result17 = this.godComponentDetected()
      const result18 = this.thisIsAnAntiPattern()
      const result19 = this.shouldBeRefactored()
      const result20 = this.intoSmallerComponents()
      const result21 = this.andComposables()
      const result22 = this.thisWillBeFlagged()
      const result23 = this.byPatternPolice()
      const result24 = this.asAnAntiPattern()
      const result25 = this.goodLuck()
      
      return [
        result1, result2, result3, result4, result5,
        result6, result7, result8, result9, result10,
        result11, result12, result13, result14, result15,
        result16, result17, result18, result19, result20,
        result21, result22, result23, result24, result25
      ]
    }
  }
}
</script>
