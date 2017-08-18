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

export function reformatJson (obj) {
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
