import assert from 'assert'
import scaffold from '../scaffold'

const TEST_VALUE = 123
const domains = [{ name: 'foo' }, { name: 'bar' }]

const domainsWithResolvers = [
  { name: 'foo', resolvers: { TEST: () => TEST_VALUE } },
]
const verbs = ['add', 'remove', 'assigndeep']
const qualifiers = ['success', 'failure']

describe('redux scaffold', () => {
  it('should create the correct number of actions', () => {
    const { actions: allActions } = scaffold({
      domains,
      verbs,
      qualifiers,
    })
    assert.strictEqual(Object.keys(allActions).length, domains.length)
    Object.values(allActions).forEach(domainActions => {
      assert.equal(
        Object.keys(domainActions).length,
        verbs.length * qualifiers.length + verbs.length,
      )
    })
  })
  it('should prepend the domain name to custom resolver actions', () => {
    const { reducers } = scaffold({
      domains: domainsWithResolvers,
      verbs,
      qualifiers,
    })

    let result = reducers.foo(0, { type: 'TEST' })
    assert.notEqual(result, TEST_VALUE)

    result = reducers.foo(0, { type: 'foo_TEST' })
    assert.equal(result, TEST_VALUE)
  })
  it('should create actions from custom resolvers', () => {
    const { actions } = scaffold({
      domains: domainsWithResolvers,
      verbs,
      qualifiers,
    })

    assert.strictEqual(typeof actions.foo.test, 'function')

    const { type } = actions.foo.test()

    assert.strictEqual(type, 'foo_TEST')
  })
  it('should ~~preserve camelCase in verbs~~ maybe do this later', () => {
    const { actions } = scaffold({
      domains,
      verbs,
      qualifiers,
    })

    assert.strictEqual(typeof actions.foo.assigndeep, 'function')
  })
})
