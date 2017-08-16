<template>
  <main id="registerScreen" class="mainBack">
    <section class="whiteContanier">
      <label for="country" class="selectBoxContainer">
        <select id="country" v-model="setCountry" @change="getAndLoad('city', setCountry)">
          <option value="0" selected disabled>ÜLKE SEÇİN</option>
          <option value="2">TÜRKİYE</option>
          <option value="1">KUZEY KIBRIS</option>
        </select>
      </label>
      <label for="city" class="selectBoxContainer" v-show="listOfCities">
        <select id="city" v-model="setCity" @change="getAndLoad('town', setCity)">
          <option value="0" selected disabled>İL SEÇİN</option>
          <option v-for="city in listOfCities" :value="city.SehirID" :key="city.index">{{city.SehirAdi}}</option>
        </select>
      </label>
      <label for="town" class="selectBoxContainer" v-show="listOfTowns">
        <select id="town" v-model="setTown">
          <option value="0" selected disabled>İLÇE SEÇİN</option>
          <option v-for="town in listOfTowns" :value="[town.IlceAdi, town.IlceID]" :key="town.index">{{town.IlceAdi}}</option>
        </select>
      </label>
      <footer>
        <button class="cancelButton" @click="changeRegistration()">VAZGEÇ</button>
        <button class="submitButton" @click="getAndLoad('period', setTown[1])" :disabled="setTown == 0">EKLE</button>
      </footer>
    </section>
  </main>
</template>

<script>
import axios from 'axios'
import db from '@/helpers/db'
import { apiData, dateArray, periodMs } from '@/helpers/reformat'

export default {
  name: 'register',
  props: ['changeRegistration', 'changePublication', 'changeSelection', 'setLocationCode', 'getLocatonName', 'getTimes', 'loadShow', 'errorShow'],
  data () {
    return {
      setCountry: 0,
      setCity: 0,
      setTown: 0,
      listOfCities: '',
      listOfTowns: '',
      listOfPeriods: ''
    }
  },
  methods: {
    getAndLoad (action, int) {
      if (parseInt(int) !== 0) {
        this.loadShow(true)
        axios.get(apiData(action, int)).then((response) => {
          this.loadShow(false)
          switch (action) {
            case 'city':
              this.setCity = 0
              this.listOfCities = (response.data)
              break
            case 'town':
              this.setTown = 0
              this.listOfTowns = (response.data)
              break
            case 'period':
              this.listOfPeriods = (response.data)
              db.transaction('rw', db.cities, db.times, db.settings, () => {
                db.cities.get({city: this.setTown[0], code: this.setTown[1]}).then(value => {
                  if (!value) {
                    db.cities.add({city: this.setTown[0], code: parseInt(this.setTown[1])}).then(() => {
                    })
                  } else {
                    this.errorShow('Bu Şehir Zaten Ekli')
                  }
                }).catch((error) => {
                  this.errorShow(error)
                })

                db.times.add({city_code: parseInt(this.setTown[1]), periods: this.reformatJson(this.listOfPeriods)}).then(() => {
                  db.settings.put({id: 1, choosen: parseInt(this.setTown[1])}).then(() => {
                    this.setLocationCode(parseInt(this.setTown[1]))
                    this.getLocatonName(parseInt(this.setTown[1]))
                    this.getTimes(parseInt(this.setTown[1]))
                    this.changeRegistration()
                    this.changeSelection()
                  })
                })
              })
              break
          }
        }).catch((error) => {
          this.errorShow(error)
        })
      }
    },
    reformatJson (obj) {
      let NEW_OBJ = []
      obj.map(function (day, ind, arr) {
        const ISHA_BEFORE = ind === 0 ? periodMs(day.MiladiTarihKisa, '00:00') : periodMs(arr[ind - 1].MiladiTarihKisa, arr[ind - 1].Yatsi)
        const FAJR = periodMs(day.MiladiTarihKisa, day.Imsak)
        const SHAMS = periodMs(day.MiladiTarihKisa, day.Gunes)
        const AVOID1 = SHAMS + 3000000
        const ZUHR = periodMs(day.MiladiTarihKisa, day.Ogle)
        const AVOID2 = ZUHR - 2700000
        const ASR = periodMs(day.MiladiTarihKisa, day.Ikindi)
        const MAGHRIB = periodMs(day.MiladiTarihKisa, day.Aksam)
        const AVOID3 = MAGHRIB - 2700000
        const GURUB = MAGHRIB - 1200000
        const ISHA = periodMs(day.MiladiTarihKisa, day.Yatsi)
        const FAJR_NEXT = ind === obj.length - 1 ? false : periodMs(arr[ind + 1].MiladiTarihKisa, arr[ind + 1].Imsak)

        const NEW_DATA = {
          'gregorian': dateArray(day.MiladiTarihKisa, 'M'),
          'hijri': dateArray(day.HicriTarihKisa, 'H'),
          'milliseconds': periodMs(day.MiladiTarihKisa, '00:00'),
          'times': [
            [ISHA_BEFORE, FAJR - ISHA_BEFORE],
            [FAJR, SHAMS - FAJR],
            [SHAMS, ZUHR - SHAMS],
            [ZUHR, ASR - ZUHR],
            [ASR, MAGHRIB - ASR],
            [MAGHRIB, ISHA - MAGHRIB],
            [ISHA, FAJR_NEXT - ISHA],
            [FAJR_NEXT, false]
          ],
          'points': [
            [ISHA_BEFORE, FAJR - ISHA_BEFORE],
            [FAJR, SHAMS - FAJR],
            [SHAMS, 3000000],
            [AVOID1, AVOID2 - AVOID1],
            [AVOID2, 2700000],
            [ZUHR, ASR - ZUHR],
            [ASR, AVOID3 - ASR],
            [AVOID3, 1500000],
            [GURUB, 1200000],
            [MAGHRIB, ISHA - MAGHRIB],
            [ISHA, (!FAJR_NEXT ? false : FAJR_NEXT - ISHA)],
            [FAJR_NEXT, false]
          ]
        }
        NEW_OBJ.push(NEW_DATA)
      })
      return NEW_OBJ
    }
  }
}
</script>

<style lang="scss">
@import '../scss/var';
  #registerScreen {
    z-index: 30;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .selectBoxContainer {
    position: relative;
    select {
      height: 70px;
      width: 100%;
      line-height: 70px;
      font-size: 17px;
      padding: 0 35px;
      background-color: rgba(255, 255, 255, 0);
      border: none;
      border-bottom: 1px solid $seperator;
      color: $bg-title-color;
      outline: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }
    &:after {
      content: '\e916';
      font-family: periods-icon;
      font-size: 24px;
      color: $primary-color;
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: -1;
    }
  }
</style>
