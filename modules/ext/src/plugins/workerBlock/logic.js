export default actions => [
  {
    type: [
      actions.workerBlockEnabled.setandlog,
      actions.workerBlockEnabled.set,
    ],
    latest: true,
    async process(_, dispatch, done) {
      done()
    },
  },
]
