export default actions => [
  {
    type: [
      actions.privacyOptionsCount.setandlog,
      actions.privacyOptionsCount.set,
    ],
    latest: true,
    async process(_, dispatch, done) {
      done()
    },
  },
]
