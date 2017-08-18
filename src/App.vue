<template>
  <div id="app">
    <header v-if="!selection" id="locationAddSelect">
      <i class="p-menu" @click="changeSelection"></i>
    </header>
    <main>
      <transition name="fade">
        <publisher :error-show="errorShow" :load-show="loadShow" :location-code="locationCode" :location-name="locationName" :period-datas="periodDatas" v-if="publication"></publisher>
      </transition>
      <transition name="fade">
        <selector :error-show="errorShow" :load-show="loadShow" :change-registration="changeRegistration" :change-selection="changeSelection" :change-publication="changePublication" :set-location-code="setLocationCode" :get-location-name="getLocationName" :get-times="getTimes" v-if="selection"></selector>
      </transition>
      <transition name="fade">
        <register :error-show="errorShow" :load-show="loadShow" :change-registration="changeRegistration" :change-publication="changePublication" :change-selection="changeSelection" :set-location-code="setLocationCode" :get-locaton-name="getLocationName" :get-times="getTimes" v-if="registration"></register>
      </transition>
    </main>
    <transition name="fade">
      <section id="loader" v-if="loading">
        <div class="loadCircle">
          <svg width="200px"  height="200px"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="loading-ring" style="background: none;">
            <circle cx="50" cy="50" fill="none" stroke-linecap="round" r="40" stroke-width="5" stroke="#3283D3" stroke-dasharray="62.83185307179586 62.83185307179586" transform="rotate(180 50 50)">
              <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1.4s" begin="0s" repeatCount="indefinite"></animateTransform>
            </circle>
          </svg>
        </div>
      </section>
    </transition>
    <transition name="fade">
      <section id="error" v-if="errorCode">
        {{errorCode}}
        <div id="errorClose" @click="errorShow(false)">
          <i class="p-close"></i>
        </div>
      </section>
    </transition>
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
      pointDatas: '',
      loading: true,
      errorCode: false
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
        setTimeout(() => {
          this.loadShow(false)
        }, 2000)
      })
    },
    errorShow (error) {
      this.errorCode = error
    },
    loadShow (boo) {
      this.loading = boo
    }
  },
  beforeCreate () {
    db.transaction('rw', db.settings, db.cities, db.times, () => {
      db.settings.get({id: 1}).then(value => {
        if (!value) {
          db.settings.add({id: 1, choosen: 0}).then(() => {
            this.loadShow(false)
            this.selection = true
          })
        } else {
          db.settings.get({id: 1}).then((value) => {
            if (value.choosen === 0) {
              this.loadShow(false)
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
        this.errorShow(error)
      })
    })
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500&subset=latin-ext');
@import '/scss/var';
@import '/scss/fonts';
  body {
    margin: 0;
    height: 100%;
    background-color: $bg-color;
    font-family: 'Roboto';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }
  .mainBack {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: $bg-color;
    color: $bg-text-color;
    font-size: 14px;
    font-weight: 500;
  }
  .whiteContanier {
    position: fixed;
    top: 50px;
    right: 20px;
    bottom: 50px;
    left: 20px;
    background-color: $w-bg-color;
    box-shadow: $w-sd;
    border-radius: 10px;
    overflow-x: hidden;
    overflow-y: scroll;
    overflow: -moz-scrollbars-none;
    &::-webkit-scrollbar { 
      display: none; 
    }
    ul {
      margin: 0 0 70px 0;
      padding: 0;
    }
    footer {
      position: fixed;
      left: 20px;
      right: 20px;
      bottom: 50px;
      height: 70px;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid $seperator;
      button {
        width: 100%;
        font-size: 16px;
        font-weight: 500;
        background-color: rgba(255, 255, 255, 0);
        border: none;
        cursor: pointer;
        &.submitButton {
          background-color: $primary-color;
          color: #FFF;
          transition: all 0.3s ease;
          &:disabled {
            background-color: $button-disabled-color;
            color: $button-disabled-text;
          } 
        }
      }
    }
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
  #loader {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 900;
    background-color: $bg-color;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .loadCircle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: #FFF;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    svg {
      width: 50px;
      height: 50px;
    }
  }
  #error {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 900;
    background-color: $bg-color;
    color: $bg-text-color;
    padding: 15px;
    font-size: 12px;
    line-height: 18px;
    font-family: monospace;
  }
  #errorClose {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: $circle-button-size;
    height: $circle-button-size;
    border-radius: 50%;
    background-color: $second-button-color;
    box-shadow: $second-button-sd;
    color: #FFF;
    font-size: $circle-button-icon-size;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s
  }
  .fade-enter, .fade-leave-to {
    opacity: 0
  }
  .list-enter-active, .list-leave-active {
    transition: opacity .2s;
  }
  .list-enter, .list-leave-to {
    opacity: 0;
  }
</style>
