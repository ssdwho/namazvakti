export function convertCountDown (distance) {
  let HOURS = (Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).toString()
  let MINUTES = (Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).toString()
  let SECONDS = (Math.floor((distance % (1000 * 60)) / 1000)).toString()

  HOURS = HOURS.length === 2 ? HOURS : `0${HOURS}`
  MINUTES = MINUTES.length === 2 ? MINUTES : `0${MINUTES}`
  SECONDS = SECONDS.length === 2 ? SECONDS : `0${SECONDS}`

  return `${HOURS}:${MINUTES}:${SECONDS}`
}

export function msToHours (ms) {
  let MS = new Date(ms)
  let HOURS = (MS.getHours()).toString()
  let MINUTES = (MS.getMinutes()).toString()

  HOURS = HOURS.length === 2 ? HOURS : `0${HOURS}`
  MINUTES = MINUTES.length === 2 ? MINUTES : `0${MINUTES}`

  return `${HOURS}:${MINUTES}`
}
