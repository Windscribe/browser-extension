export default actions => [
  {
    type: [
      actions.locationLoadEnabled.setandlog,
      actions.locationLoadEnabled.set,
    ],
    latest: true,
    async process(_, dispatch, done) {
      done()
    },
  },
]
