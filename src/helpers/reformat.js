const API_URL = 'https://ezanvakti.herokuapp.com/'

export function apiData (action, int) {
  let REQ
  switch (action) {
    case 'city':
      REQ = 'sehirler?ulke='
      break
    case 'town':
      REQ = 'ilceler?sehir='
      break
    case 'period':
      REQ = 'vakitler?ilce='
      break
  }

  return API_URL + REQ + int
}

export function dateArray (date, calendar) {
  const NEW_DATE = date.split('.').reverse().map(function (item) { return parseInt(item) })
  if (calendar !== 'H') { NEW_DATE[1] -= 1 }

  return NEW_DATE
}

export function timeArray (date, time) {
  const DATE_ARRAY = dateArray(date)
  const TIME_SPLIT = time.split(':').map(function (item) { return parseInt(item) })
  DATE_ARRAY.push(TIME_SPLIT)

  return DATE_ARRAY.reduce(function (a, b) { return a.concat(b) }, [])
}

export function periodMs (date, time) {
  const PERIOD_DATE = timeArray(date, time)
  const PERIOD_DATE_TIME = new Date(...PERIOD_DATE)
  const PERIOD_MS = PERIOD_DATE_TIME.getTime()

  return PERIOD_MS
}
