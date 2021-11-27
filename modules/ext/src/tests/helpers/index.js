// eslint-disable-next-line no-unused-vars
/* global store, window */
const chai = require('chai')
chai.use(require('chai-interface'))
const expect = chai.expect
const path = require('path')
const { Serverlist, ServerlistGroup } = require('./interfaces.js')

const screenshot = (popup, name) =>
  popup.screenshot({
    path: path.resolve(`./automated_tests/screenshots/${name}.png`),
    omitBackground: true,
  })

const click = async (popup, selector) => {
  try {
    await popup.waitForSelector(selector, {
      visible: true,
      timeout: 5000,
    })
    await popup.click(selector)
  } catch (e) {
    throw e
  }
}

const getState = page =>
  page.evaluate(
    // NOTE: this function gets stringified!
    () => store.getState(),
  )

const gpsExp = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/
const upperCaseExp = /[A-Z]/

const testServerlist = list => {
  // base type checks
  expect(list).to.have.interface(Serverlist)
  // specific tests
  expect(list.country_code).to.match(upperCaseExp)
  expect(list.premium_only).to.be.oneOf([0, 1])
  expect(list.short_name).to.be.match(upperCaseExp)
}

const testServerlistGroup = group => {
  // base type checks
  expect(group).to.have.interface(ServerlistGroup)
  // specific tests
  expect(group.pro).to.be.oneOf([0, 1])
  expect(group.gps).to.match(gpsExp)
  if (group.hosts) {
    expect(group.hosts).not.have.lengthOf(0)
  }
}

module.exports = {
  testServerlist,
  testServerlistGroup,
  getState,
  screenshot,
  click,
}
