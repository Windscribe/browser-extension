/* eslint-disable no-undef */
function timeString() {
  return new Date()
    .toTimeString()
    .split('(')[1]
    .split(')')[0]
}

function isNative(fn) {
  return /\{\s*\[native code\]\s*\}/.test('' + fn)
}

function isClass(obj) {
  const isCtorClass =
    obj.constructor && obj.constructor.toString().substring(0, 5) === 'class'
  if (obj.prototype === undefined) {
    return isCtorClass
  }
  const isPrototypeCtorClass =
    obj.prototype.constructor &&
    obj.prototype.constructor.toString &&
    obj.prototype.constructor.toString().substring(0, 5) === 'class'
  return isCtorClass || isPrototypeCtorClass
}

function intlTimezone(timeZone) {
  const ODateTimeFormat = Intl.DateTimeFormat
  Intl.DateTimeFormat = function(locales, options = {}) {
    Object.assign(options, {
      timeZone,
    })
    return ODateTimeFormat(locales, options)
  }

  Intl.DateTimeFormat.prototype = Object.create(ODateTimeFormat.prototype)
  Intl.DateTimeFormat.supportedLocalesOf = ODateTimeFormat.supportedLocalesOf
  return ODateTimeFormat
}

function shiftedDate(offset, defaultOffset, dst) {
  var clean = str => {
    const toGMT = offset => {
      const z = n => (n < 10 ? '0' : '') + n
      const sign = offset <= 0 ? '+' : '-'
      offset = Math.abs(offset)
      return sign + z((offset / 60) | 0) + z(offset % 60)
    }
    const GMTIndex = str.indexOf('GMT')
    const currentGMT = str.substring(GMTIndex + 3, GMTIndex + 8)
    str = str.replace(currentGMT, toGMT(offset))
    if (str.indexOf(' (') !== -1) {
      str = str.split(' (')[0] + ' (' + dst + ')'
    }
    return str
  }

  var {
    getTime,
    getDate,
    getDay,
    getFullYear,
    getHours,
    getMilliseconds,
    getMinutes,
    getMonth,
    getSeconds,
    getYear,
    toDateString,
    toLocaleString,
    toString,
    toTimeString,
    toLocaleTimeString,
    toLocaleDateString,
    setYear,
    setHours,
    setTime,
    setFullYear,
    setMilliseconds,
    setMinutes,
    setMonth,
    setSeconds,
    setDate,
    setUTCDate,
    setUTCFullYear,
    setUTCHours,
    setUTCMilliseconds,
    setUTCMinutes,
    setUTCMonth,
    setUTCSeconds,
  } = ODate.prototype

  window.ShiftedDate = class extends ODate {
    constructor(...args) {
      super(...args)
      if (!isClass(Date)) {
        // constructor was tampered with, fallback ->
        Date.prefs = ['Antarctica/McMurdo', -780, 300, 'McMurdo Daylight Time']
      }

      this.nd = new ODate(
        getTime.apply(this) + (defaultOffset - offset) * 60 * 1000,
      )
    }

    // get
    toLocaleString(...args) {
      return toLocaleString.apply(this.nd, args)
    }
    toLocaleTimeString(...args) {
      return toLocaleTimeString.apply(this.nd, args)
    }
    toLocaleDateString(...args) {
      return toLocaleDateString.apply(this.nd, args)
    }
    toDateString(...args) {
      return toDateString.apply(this.nd, args)
    }
    getDate(...args) {
      return getDate.apply(this.nd, args)
    }
    getDay(...args) {
      return getDay.apply(this.nd, args)
    }
    getFullYear(...args) {
      return getFullYear.apply(this.nd, args)
    }
    getHours(...args) {
      return getHours.apply(this.nd, args)
    }
    getMilliseconds(...args) {
      return getMilliseconds.apply(this.nd, args)
    }
    getMinutes(...args) {
      return getMinutes.apply(this.nd, args)
    }
    getMonth(...args) {
      return getMonth.apply(this.nd, args)
    }
    getSeconds(...args) {
      return getSeconds.apply(this.nd, args)
    }
    getYear(...args) {
      return getYear.apply(this.nd, args)
    }
    // set
    setHours(...args) {
      const a = getTime.call(this.nd)
      const b = setHours.apply(this.nd, args)
      setTime.call(this, getTime.call(this) + b - a)
      return b
    }
    setFullYear(...args) {
      const a = getTime.call(this.nd)
      const b = setFullYear.apply(this.nd, args)
      setTime.call(this, getTime.call(this) + b - a)
      return b
    }
    setMilliseconds(...args) {
      const a = getTime.call(this.nd)
      const b = setMilliseconds.apply(this.nd, args)
      setTime.call(this, getTime.call(this) + b - a)
      return b
    }
    setMinutes(...args) {
      const a = getTime.call(this.nd)
      const b = setMinutes.apply(this.nd, args)
      setTime.call(this, getTime.call(this) + b - a)
      return b
    }
    setMonth(...args) {
      const a = getTime.call(this.nd)
      const b = setMonth.apply(this.nd, args)
      setTime.call(this, getTime.call(this) + b - a)
      return b
    }
    setSeconds(...args) {
      const a = getTime.call(this.nd)
      const b = setSeconds.apply(this.nd, args)
      setTime.call(this, getTime.call(this) + b - a)
      return b
    }
    setDate(...args) {
      const a = getTime.call(this.nd)
      const b = setDate.apply(this.nd, args)
      setTime.call(this, getTime.call(this) + b - a)
      return b
    }
    setYear(...args) {
      const a = getTime.call(this.nd)
      const b = setYear.apply(this.nd, args)
      setTime.call(this, getTime.call(this) + b - a)
      return b
    }
    setTime(...args) {
      const a = getTime.call(this)
      const b = setTime.apply(this, args)
      setTime.call(this.nd, getTime.call(this.nd) + b - a)
      return b
    }
    setUTCDate(...args) {
      const a = getTime.call(this)
      const b = setUTCDate.apply(this, args)
      setTime.call(this.nd, getTime.call(this.nd) + b - a)
      return b
    }
    setUTCFullYear(...args) {
      const a = getTime.call(this)
      const b = setUTCFullYear.apply(this, args)
      setTime.call(this.nd, getTime.call(this.nd) + b - a)
      return b
    }
    setUTCHours(...args) {
      const a = getTime.call(this)
      const b = setUTCHours.apply(this, args)
      setTime.call(this.nd, getTime.call(this.nd) + b - a)
      return b
    }
    setUTCMilliseconds(...args) {
      const a = getTime.call(this)
      const b = setUTCMilliseconds.apply(this, args)
      setTime.call(this.nd, getTime.call(this.nd) + b - a)
      return b
    }
    setUTCMinutes(...args) {
      const a = getTime.call(this)
      const b = setUTCMinutes.apply(this, args)
      setTime.call(this.nd, getTime.call(this.nd) + b - a)
      return b
    }
    setUTCMonth(...args) {
      const a = getTime.call(this)
      const b = setUTCMonth.apply(this, args)
      setTime.call(this.nd, getTime.call(this.nd) + b - a)
      return b
    }
    setUTCSeconds(...args) {
      const a = getTime.call(this)
      const b = setUTCSeconds.apply(this, args)
      setTime.call(this.nd, getTime.call(this.nd) + b - a)
      return b
    }
    // toString
    toString(...args) {
      return clean(toString.apply(this.nd, args))
    }
    toTimeString(...args) {
      return clean(toTimeString.apply(this.nd, args))
    }
    // offset
    getTimezoneOffset() {
      return offset
    }
  }
}

const injectScript = content => {
  const script = document.createElement('script')
  script.textContent = content
  document.documentElement.insertBefore(script, document.head)
  script.remove()
}

const shiftTime = timeWarp =>
  injectScript(`
  if (typeof wsAllowlisted === 'undefined') {
    if (!window.ODate) {
      window.ODate = Date
    }
    ${isNative.toString()}
    ${isClass.toString()}
    ${timeString.toString()}
    ${intlTimezone.toString()}
    intlTimezone('${timeWarp.location}');
    ${shiftedDate.toString()}
    shiftedDate(${timeWarp.offset}, ${timeWarp.defaultOffset}, '${
    timeWarp.dst
  }');
    Date = window.ShiftedDate;
  }
`)

browser.runtime
  .sendMessage({
    type: 'get-state',
    payload: ['proxyTimeEnabled'],
  })
  .then(data => {
    if (data !== undefined && data[0]) {
      browser.storage.local.get('timeWarp').then(({ timeWarp }) => {
        if (timeWarp) shiftTime(timeWarp)
      })
    }
  })
