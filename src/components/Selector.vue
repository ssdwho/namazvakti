<template>
  <div id="selectScreen">
    <div id="locationContainer">
      <div class="location" :class="{selected: city.code === choosen}" @click="chooseLocation(city.code)" v-for="city in locationList" :key="city.code">{{city.city}}</div>
    </div>
    <div id="addNew">
      <i class="p-add_location" @click="toAddPage"></i>
    </div>
  </div>
</template>

<script>
import db from '@/helpers/db'

export default {
  name: 'selector',
  props: ['changeSelection', 'changeRegistration', 'changePublication', 'setLocationCode', 'getLocationName', 'getTimes'],
  data () {
    return {
      choosen: '',
      locationList: ''
    }
  },
  methods: {
    toAddPage () {
      this.changeRegistration()
    },
    chooseLocation (cityCode) {
      db.transaction('rw', db.times, db.cities, db.settings, () => {
        db.settings.put({id: 1, choosen: cityCode}).then(value => {
          this.setLocationCode(cityCode)
          this.getLocationName(cityCode)
          this.getTimes(cityCode)
          this.changeSelection()
        })
      })
    }
  },
  created () {
    db.transaction('r', db.cities, db.settings, () => {
      db.settings.get({id: 1}).then(value => {
        this.choosen = value.choosen
        db.cities.toArray().then(value => {
          this.locationList = value
        })
      })
    })
  }
}
</script>

<style lang="scss">
@import '../scss/fonts';
  #selectScreen {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    background-color: #FFF;
  }
  #addNew {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #481232;
    color: #FFF;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.6)
  }
  #locationContainer {
    display: flex;
    flex-wrap: wrap;
  }
  .location {
    width: 33.3%;
    height: 50px;
    box-sizing: border-box;
    border: solid #dacfd6;
    border-width: 0 1px 1px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    &:nth-child(3) {
      border-right: none;
    }
    &.selected {
      background-color: #481232;
      color: #FFF;
    }
  }
</style>
