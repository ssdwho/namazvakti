import Dexie from 'dexie'

const db = new Dexie('NamazVakti')

db.version(1).stores({
  cities: `++id, city, code`,
  times: `++id, &city_code, periods`,
  settings: `++id, choosen`
})

export default db
