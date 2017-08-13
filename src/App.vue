<template>
  <div id="app">
    <header v-if="!selection" id="locationAddSelect">
      <i class="p-settings" @click="changeSelection"></i>
    </header>
    <main>
      <transition name="fade">
        <publisher :location-code="locationCode" :location-name="locationName" :period-datas="periodDatas" v-if="publication"></publisher>
      </transition>
      <transition name="fade">
        <selector :change-registration="changeRegistration" :change-selection="changeSelection" :change-publication="changePublication" :set-location-code="setLocationCode" :get-location-name="getLocationName" :get-times="getTimes" v-if="selection"></selector>
      </transition>
      <transition name="fade">
        <register :change-registration="changeRegistration" :change-publication="changePublication" :change-selection="changeSelection" :set-location-code="setLocationCode" :get-locaton-name="getLocationName" :get-times="getTimes" v-if="registration"></register>
      </transition>
    </main>
  </div>
</template>

<script>
import db from '@/helpers/db'
import Selector from '@/components/Selector'
import Register from '@/components/Register'
import Publisher from '@/components/Publisher'

export default {
  name: 'app',
  components: {
    Selector,
    Register,
    Publisher
  },
  data () {
    return {
      selection: false,
      registration: false,
      publication: false,
      locationCode: '',
      locationName: '',
      periodDatas: '',
      pointDatas: ''
    }
  },
  methods: {
    changeSelection () {
      this.selection = !this.selection
    },
    changeRegistration () {
      this.registration = !this.registration
    },
    changePublication () {
      this.publication = !this.publication
    },
    selectLocation () {
      this.selection = true
    },
    setLocationCode (lCode) {
      this.locationCode = lCode
    },
    getLocationName (lCode) {
      db.cities.get({code: lCode}).then((value) => {
        this.locationName = value.city
      })
    },
    getTimes (lCode) {
      db.times.get({city_code: lCode}).then((value) => {
        this.periodDatas = value.periods
        this.publication = true
      })
    }
  },
  computed: {
  },
  beforeCreate () {
    db.transaction('rw', db.settings, db.cities, db.times, () => {
      db.settings.get({id: 1}).then(value => {
        if (!value) {
          db.settings.add({id: 1, choosen: 0}).then(() => {
            this.selection = true
          })
        } else {
          db.settings.get({id: 1}).then((value) => {
            if (value.choosen === 0) {
              this.selection = true
            } else {
              this.setLocationCode(value.choosen)
              this.getLocationName(value.choosen)
              this.getTimes(value.choosen)
            }
          })
        }
      })
      .catch((error) => {
        console.log(error)
      })
    })
  },
  created () {
  },
  mounted () {
  }
}
</script>

<style lang="scss">
  body {
    margin: 0;
    height: 100%;
    background-color: #CFD8DC;
    font-family: 'Overpass';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }
  #locationAddSelect {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 100;
    width: 16vmin;
    height: 16vmin;
    color: rgba(255, 255, 255, 0.6);
    font-size: 8vmin;
    line-height: 16vmin;
    display: flex;
    justify-content: center;
    align-items: center;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.6)
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }
  .fade-enter, .fade-leave-to {
    opacity: 0
  }
  .list-enter-active, .list-leave-active {
    transition: opacity 1s;
  }
  .list-enter, .list-leave-to {
    opacity: 0;
  }
</style>
