let Noop = () => null
export default ({ if: cond, Then, Else = Noop }) => (cond ? Then() : Else())
