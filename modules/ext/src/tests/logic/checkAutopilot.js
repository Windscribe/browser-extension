/* global store */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect

module.exports = {
  name: 'CheckAutoPilotList',
  target: 'chrome',
  it: 'Should see if autopilot list matches users premium status',
  eval: async () => {
    const { session, cruiseControlList } = store.getState()
    return [session, cruiseControlList]
  },
  assert: ([session, cruiseControlList]) => {
    const { is_premium } = session

    cruiseControlList.data.forEach(country => {
      country.groups.forEach(dataCenter => {
        if (!is_premium) {
          // each datacenter in the country set should be free (0)
          expect(
            dataCenter.pro,
            `User is free, but has access to premium autopilot datacenter: ${JSON.stringify(
              dataCenter,
            )}`,
          ).to.equal(0)
        } else {
          // you are premium, so it can be both
          expect(
            dataCenter.pro,
            'User is premium, but has no access to autopilot datacenter',
          ).to.be.oneOf([0, 1])
        }
      })
    })
  },
}
