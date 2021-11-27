import punycode from 'punycode'
import publicSuffixList from 'lib/public-suffix-list'
import list from 'lib/effective_tld_names'

const state = {
  isParsed: false,
}

export const initSuffixList = () => {
  publicSuffixList.parse(list, punycode.toASCII)

  state.isParsed = true
}

export const isParsed = () => state.isParsed

export const getDomain = publicSuffixList.getDomain
