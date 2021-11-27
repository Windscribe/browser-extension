import { DispatcherArgs } from './commonTypes'

const noop = () => {
  /* no operation*/
}

const dispatcher = ({
  getConfig,
  dispatch,
  actionCreator,
  data,
}: DispatcherArgs): void => {
  if (dispatch) {
    return dispatch(actionCreator(data))
  }
  if (getConfig && getConfig().dispatch) {
    return getConfig().dispatch(actionCreator(data))
  }
  return noop()
}

export default dispatcher
