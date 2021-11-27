import { flatten } from 'lodash'
import * as plugins from 'plugins'

export default () =>
  flatten(Object.values(plugins).map(p => p.lexiconEntries || []))
