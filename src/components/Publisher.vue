<template>
  <div>
    <main :class="[points.class[points.indexPoint]]" id="publishState">
      <div v-for="(bg, index) in points.class" class="background" :class="[points.class[index]]" :key="index"></div>
      <div id="circle">
        <svg id="circle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <defs>
            <filter id="svgFilter" name="svgFilter">
              <feGaussianBlur stdDeviation="3" in="SourceGraphic"/>
              <feOffset/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path v-for="(svg, index) in svgs" class="backPlaceHolder" :d="svg" :key="index"/>

          <path class="activeNav" :stroke-dasharray="circleLength" :stroke-dashoffset="circlePosition" :d="svgs[indexSvg]"/>
        </svg>
      </div>
      <div id="locationCountDown">
        <span>{{locationName}}</span>
        <span>{{periods.countDown[periods.indexPeriod]}}</span>
      </div>
      <div v-for="(time, index) in periodDatas" v-if="index === indexToday" :key="index">
        <ul id="periods">
          <li class="period" :class="[{activePeriod: periods.indexPeriod === index, formerPeriod: periods.indexPeriod - 1 === index}, periods.class[index]]" v-if="showHide(index)" v-for="(period, index) in time.times" :key="index">
            <i :class="[periods.icons[index]]"></i>
            <div class="nameTime">
              <p>{{periods.labels[index]}}</p>
              <p>{{msToHours(period[0])}}</p>
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script>
import { convertCountDown, msToHours } from '@/helpers/publish'

export default {
  name: 'publisher',
  props: ['locationCode', 'locationName', 'periodDatas'],
  data () {
    return {
      moment: '',
      indexToday: '',
      periods: {
        countDown: '',
        indexPeriod: '',
        differencesArray: '',
        millisecondsArray: '',
        icons: ['p-isha', 'p-fajr', 'p-shams', 'p-zuhr', 'p-asr', 'p-maghrib', 'p-isha', 'p-fajr'],
        class: ['isha', 'fajr', 'shams', 'zuhr', 'asr', 'maghrib', 'isha', 'fajr'],
        labels: ['Yatsı', 'İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı', 'İmsak']
      },
      points: {
        countDown: '',
        indexPoint: '',
        differencesArray: '',
        millisecondsArray: '',
        class: [false, 'isha', 'fajr', 'shams', 'avoid1', 'avoid2', 'zuhr', 'asr', 'avoid3', 'gurub', 'maghrib', 'isha']
      },
      svgs: ['M361.16,83.52a239.58,239.58,0,0,1,139.56,78.55', 'M557.31,284A241.47,241.47,0,0,1,546.5,399.55', 'M450.44,521.49a238.23,238.23,0,0,1-89.28,35', 'M278.84,556.48a238.23,238.23,0,0,1-89.28-35', 'M93.5,399.55A241.47,241.47,0,0,1,82.69,284', 'M139.28,162.07A239.58,239.58,0,0,1,278.84,83.52'],
      indexSvg: '',
      circleLength: '',
      circlePosition: ''
    }
  },
  methods: {
    findIndex () {
      let today = new Date().setHours(0, 0, 0, 0)

      const LIST = this.periodDatas.map(function (item) { return item.milliseconds })
      const INDEX = LIST.findIndex(function (item) {
        return item === today
      })

      this.indexToday = INDEX
    },
    countDown (distance) {
      const COUNTER = distance < 0 ? false : convertCountDown(distance)
      return COUNTER
    },
    timeFunctions () {
      const PEARRAY = this.periodDatas[this.indexToday].times
      const PEMILLISECONDS = PEARRAY.map((item) => { return item[0] })
      const PEDIFFERENCES = PEARRAY.map((item) => { return item[1] })

      this.periods.differencesArray = PEDIFFERENCES
      this.periods.millisecondsArray = PEMILLISECONDS
      this.periods.countDown = PEMILLISECONDS.map((item) => { return this.countDown(item - this.moment) })
      this.periods.indexPeriod = this.periods.countDown.findIndex((item) => { return item })

      const POARRAY = this.periodDatas[this.indexToday].points
      const POMILLISECONDS = POARRAY.map((item) => { return item[0] })
      const PODIFFERENCES = POARRAY.map((item) => { return item[1] })

      this.points.differencesArray = PODIFFERENCES
      this.points.millisecondsArray = POMILLISECONDS
      this.points.countDown = POMILLISECONDS.map((item) => { return this.countDown(item - this.moment) })
      this.points.indexPoint = this.points.countDown.findIndex((item) => { return item })

      this.circlePosition = (PEARRAY[this.periods.indexPeriod][0] - this.moment) * (this.circleLength / PEARRAY[this.periods.indexPeriod - 1][1])
    },
    lengthSvg () {
      this.indexSvg = this.periods.indexPeriod === 1 ? 5 : this.periods.indexPeriod - 2
      this.circleLength = document.querySelectorAll('.backPlaceHolder')[this.indexSvg].getTotalLength()
    },
    liveTimer () {
      this.moment = new Date().getTime()
      this.findIndex()
      this.timeFunctions()
    },
    msToHours (ms) {
      return msToHours(ms)
    },
    showHide (ind) {
      return (this.periods.indexPeriod === 1) && (ind !== 6 && ind !== 7) || (this.periods.indexPeriod > 1 && this.periods.indexPeriod < 6) && (ind !== 0 && ind !== 7) || (this.periods.indexPeriod === 7) && (ind !== 0 && ind !== 1)
    }
  },
  computed: {
  },
  mounted () {
    setInterval(this.liveTimer, 1000)
  },
  updated () {
    setInterval(this.lengthSvg(), 1000)
  }
}
</script>

<style lang="scss">
  #publishState {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    color: #fff;
    z-index: 10;
  }
  .background {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    &.fajr {
      background: linear-gradient(#3A4F6E 0%, #655E75 30%, #D3808A 70%, #F4ACA0 90%, #F8F3C9 100%);
    }
    &.shams {
      background: linear-gradient(#30659D 0%, #5E98C9 30%, #CEC1B0 60%, #F4A871 80%, #F8714B 100%);
    }
    &.avoid1 {
      background: linear-gradient(#4089D1 0%, #4CA2EC 60%, #5BACEB 100%);
    }
    &.avoid2 {
      background: linear-gradient(#4089D1 20%, #4CA2EC 100%);
    }
    &.zuhr {
      background: linear-gradient(#1A4285 0%, #0771C7 40%, #4089D1 65%, #4CA2EC 100%);
    }
    &.asr {
      background: linear-gradient(#012D78 0%, #0771C7 50%, #4089D1 75%, #4CA2EC 100%);
    }
    &.avoid3 {
      background: linear-gradient(#0771C7 0%, #E96B1F 70%, #B50F07 100%);
    }
    &.gurub {
      background: linear-gradient(#150C1F 0%, #012D78 30%, #E96B1F 100%);
    }
    &.maghrib {
      background: linear-gradient(#150C1F 0%, #171017 30%, #422C41 65%, #954E88 85%, #FF828A 100%);
    }
    &.isha {
      background: linear-gradient(#040916 0%, #081F42 70%, #0C356E 100%);
    }
  }
  $class-slug: background !default;

  @for $i from 1 through 12{
    .#{$class-slug}:nth-child(#{$i}) {
      z-index: 20 - $i
    }
  }
  #circle {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100vmin;
    height: 100vmin;
    z-index: 30;
    path {
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 5px;
      fill: none;
    }
    .backPlaceHolder {
      stroke: rgba(255,255,255,0.25);
    }
    .activeNav {
      stroke: #fff;
      filter: url(#svgFilter);
    }
  }
  #periods {
    list-style: none;
    width: 100vmin;
    height: 100vmin;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    padding: 0;
    z-index: 30;
  }
  .period {
    position: absolute;
    width: 12vmin;
    height: 12vmin;
    color: rgba(255,255,255,0.25);
    &.activePeriod {
      color: rgba(255, 255, 255, 1);
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    }
    &.formerPeriod {
      color: rgba(255, 255, 255, 0.7);
    }
    &.fajr {
      top: 0;
      left: 50%;
      transform: translate(-50%, 30%)
    }
    &.shams {
      top: 20%;
      right: 15%;
      transform: translate(50%, 30%)
    }
    &.zuhr {
      bottom: 22%;
      right: 20%;
      transform: translate(50%, -30%)
    }
    &.asr {
      bottom: 6%;
      left: 50%;
      transform: translate(-50%, -30%)
    }
    &.maghrib {
      bottom: 22%;
      left: 20%;
      transform: translate(-50%, -30%)
    }
    &.isha {
      top: 20%;
      left: 15%;
      transform: translate(-50%, 30%)
    }
    i {
      font-size: 12.5vmin;
      line-height: 1;
    }
    .nameTime {
      position: absolute;
      bottom: 0;
      text-align: center;
      transform: translateY(7.5vmin);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      p {
        line-height: 1;
        display: block;
        margin: 0;
        line-height: 4vmin;
        width: 12.5vmin;
      }
      p:nth-of-type(1) {
        font-size: 2.8vmin;
      }
      p:nth-of-type(2) {
        font-weight: 300;
        font-size: 3vmin;
      }
    }
  }
  #locationCountDown {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 30;
    span:nth-of-type(1) {
      font-size: 4vmin;
    }
    span:nth-of-type(2) {
      font-size: 8vmin;
    }
  }
</style>
