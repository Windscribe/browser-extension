// https://github.com/haliaeetus/iso-639/blob/master/data/iso_639-1.json
// iso_639-1
import { ACTIVE_LANGUAGES_MAP } from 'utils/constants'

const DEFAULT_ISO_CODE = '639-1'

export const getNativeName = (englishName, altNativeName = false) => {
  const name = englishName.toLowerCase()
  const nameKey = ACTIVE_LANGUAGES_MAP[name]
  //it is possible the name can also have native permuations (signifiers to differentiate languages like Gaelic to their geo region -> Scottish Gaelic)
  const nativeName = isoLangList[nameKey]?.nativeName
    .split(',')
    .map(e => e.trim())

  // at most there is (should be) 1 variation on the native name
  if (nativeName.length > 1 && altNativeName) {
    return nativeName[1]
  } else {
    return nativeName[0]
  }
}

export const getIsoName = englishName => {
  const name = englishName.toLowerCase()
  const nameKey = ACTIVE_LANGUAGES_MAP[name]
  return isoLangList[nameKey][DEFAULT_ISO_CODE]
}

const isoLangList = {
  ar: {
    '639-1': 'ar',
    '639-2': 'ara',
    family: 'Afro-Asiatic',
    name: 'Arabic',
    nativeName: 'العربية',
  },
  zh: {
    '639-1': 'zh',
    '639-2': 'zho',
    '639-2/B': 'chi',
    family: 'Sino-Tibetan',
    name: 'Chinese',
    nativeName: '汉语, 漢語',
  },
  nl: {
    '639-1': 'nl',
    '639-2': 'nld',
    '639-2/B': 'dut',
    family: 'Indo-European',
    name: 'Dutch',
    nativeName: 'Nederlands, Vlaams',
  },
  en: {
    '639-1': 'en',
    '639-2': 'eng',
    family: 'Indo-European',
    name: 'English',
    nativeName: 'English',
  },
  fr: {
    '639-1': 'fr',
    '639-2': 'fra',
    '639-2/B': 'fre',
    family: 'Indo-European',
    name: 'French',
    nativeName: 'Français, Langue Française',
  },
  de: {
    '639-1': 'de',
    '639-2': 'deu',
    '639-2/B': 'ger',
    family: 'Indo-European',
    name: 'German',
    nativeName: 'Deutsch',
  },
  hi: {
    '639-1': 'hi',
    '639-2': 'hin',
    family: 'Indo-European',
    name: 'Hindi',
    nativeName: 'हिन्दी, हिंदी',
  },
  it: {
    '639-1': 'it',
    '639-2': 'ita',
    family: 'Indo-European',
    name: 'Italian',
    nativeName: 'Italiano',
  },
  pt: {
    '639-1': 'pt',
    '639-2': 'por',
    family: 'Indo-European',
    name: 'Portuguese',
    nativeName: 'Português',
  },
  ru: {
    '639-1': 'ru',
    '639-2': 'rus',
    family: 'Indo-European',
    name: 'Russian',
    nativeName: 'Русский',
  },
  sv: {
    '639-1': 'sv',
    '639-2': 'swe',
    family: 'Indo-European',
    name: 'Swedish',
    nativeName: 'Svenska',
  },
  es: {
    '639-1': 'es',
    '639-2': 'spa',
    family: 'Indo-European',
    name: 'Spanish',
    nativeName: 'Español',
  },
  tr: {
    '639-1': 'tr',
    '639-2': 'tur',
    family: 'Turkic',
    name: 'Turkish',
    nativeName: 'Türkçe',
  },
  ja: {
    '639-1': 'ja',
    '639-2': 'jpn',
    family: 'Japonic',
    name: 'Japanese',
    nativeName: '日本語 (にほんご), 日本語',
  },
  id: {
    '639-1': 'id',
    '639-2': 'ind',
    family: 'Austronesian',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia, Bahasa',
  },
  ko: {
    '639-1': 'ko',
    '639-2': 'kor',
    family: 'Koreanic',
    name: 'Korean',
    nativeName: '한국어',
  },
  vi: {
    '639-1': 'vi',
    '639-2': 'vie',
    family: 'Austroasiatic',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
  },
  th: {
    '639-1': 'th',
    '639-2': 'tha',
    family: 'Tai–Kadai',
    name: 'Thai',
    nativeName: 'ไทย',
  },
}

export default isoLangList
