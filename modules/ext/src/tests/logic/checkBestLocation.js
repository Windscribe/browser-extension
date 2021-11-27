/* global store */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = {
  name: 'CheckBestLocation',
  target: 'chrome',
  it: 'Should see if you have valid best location host',
  eval: async () => {
    const { serverList, bestLocation, session } = store.getState()
    return [serverList, bestLocation, session]
  },
  assert: ([serverList, bestLocation, session]) => {
    const { is_premium } = session
    const bestLocationId = bestLocation.locationId
    const matchedServerLocation = serverList.data.find(
      loc => loc.id === bestLocationId,
    )
    const matchedServerDc = matchedServerLocation.groups.find(
      dc => dc.id === bestLocation.id,
    )

    if (!is_premium) {
      expect(
        matchedServerDc.pro,
        `User is free, but best Location is a premium datacenter: ${JSON.stringify(
          matchedServerDc,
        )}`,
      ).to.equal(0)
    } else {
      // you are premium, so it can be both
      expect(
        matchedServerDc.pro,
        'User is premium, but has no access to best location datacenter',
      ).to.be.oneOf([0, 1])
    }
  },
}
