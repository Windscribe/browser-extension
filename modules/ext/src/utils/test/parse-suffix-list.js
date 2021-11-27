import assert from 'assert'
import { getDomain, initSuffixList } from '../parse-suffix-list'

const testDomains = [
  {
    base: 'www.google.com',
    result: 'google.com',
  },
  {
    base: 'test.bbc.co.uk',
    result: 'bbc.co.uk',
  },
  {},
]

describe('Check suffix list parser', async () => {
  initSuffixList()

  it('Should get the get the bare domain', () => {
    const transformed = testDomains.reduce((arr, x) => {
      if (x.result) {
        arr.push({ result: x.result, base: getDomain(x.base) })
      }

      return arr
    }, [])

    assert(transformed.every(x => x.base === x.result))
  })
})
