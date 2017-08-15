<template>
  <main id="selectScreen" class="mainBack">
    <span v-if="!locationList.length">Henüz eklenmiş bir lokasyon yok.</span>
    <section v-if="locationList.length" class="whiteContanier">
      <ul>
        <li v-for="(city, index) in locationList" class="whiteList" :class="{selected: city.code === choosen}" :key="city.code">
          <div class="cityContainer">
            <span class="cityName" @click="chooseLocation(city.code)">{{city.city}}</span>
            <span class="cityRemove" @click="removeLocation(city.id, city.city, city.code)"><i class="p-delete"></i></span>
          </div>
        </li>
      </ul>
    </section>
    <div id="addNew" @click="toAddPage">
      <i class="p-add"></i>
    </div>
  </main>
</template>

<script>
import db from '@/helpers/db'

export default {
  name: 'selector',
  props: ['changeSelection', 'changeRegistration', 'changePublication', 'setLocationCode', 'getLocationName', 'getTimes', 'loadShow', 'errorShow'],
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
    getListfromDB () {
      db.transaction('r', db.cities, db.settings, () => {
        db.settings.get({id: 1}).then(value => {
          this.choosen = value.choosen
          db.cities.toArray().then(value => {
            this.locationList = value
          })
        })
      })
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
    },
    removeLocation (ind, cityName, cityCode) {
      if (window.confirm(`${cityName} silinecek. Onaylıyor musunuz?`)) {
        console.log(ind + cityName)
        db.transaction('rw', db.times, db.cities, db.settings, () => {
          db.cities.delete(ind).then(() => {
            db.times.delete(ind).then(() => {
              db.settings.get({id: 1}).then(value => {
                console.log(value.choosen)
                console.log(cityCode)
                if (value.choosen === cityCode) {
                  db.settings.put({id: 1, choosen: 0})
                }
                this.getListfromDB()
              })
            })
          })
        })
      }
    }
  },
  created () {
    this.getListfromDB()
  }
}
</script>

<style lang="scss">
@import '../scss/var';
  #selectScreen {
    z-index: 20;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  #addNew {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: $circle-button-size;
    height: $circle-button-size;
    border-radius: 50%;
    background-color: $button-color;
    box-shadow: $button-sd;
    color: #FFF;
    font-size: $circle-button-icon-size;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .whiteList {
    list-style: none;
    color: $w-subtitle;
    font-size: 17px;
    &:last-of-type {
      .cityContainer {
        border-bottom: none;
      }
    }
    &.selected {
      background-color: $primary-dark;
      color: #FFF;
    }
  }
  .cityContainer {
    margin: 0 20px;
    border-bottom: 1px solid $seperator;
    height: 70px;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    font-weight: 400;
  }
  .cityName {
    width: 100%;
    line-height: 70px;
    padding: 0 15px;
  }
  .cityRemove {
    padding: 0 15px;
    line-height: 70px;
    font-size: 22px;
    color: $primary-color;
  }
</style>
