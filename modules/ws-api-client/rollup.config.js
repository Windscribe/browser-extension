import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import fileSize from 'rollup-plugin-filesize'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'

const plugins = [
  typescript(),
  resolve(),
  babel({
    exclude: 'node_modules/**',
  }),
  terser(),
  fileSize(),
]

const constructBuildFile = (filename = 'index') => ({
  input: `src/${filename}.ts`,
  output: [
    {
      file: `es/${filename}.js`,
      format: 'es',
    },
    { file: `cjs/${filename}.js`, format: 'cjs' },
  ],
  external: ['md5', 'url-join', 'lodash', 'query-string'],
  plugins,
})

export default [constructBuildFile(), constructBuildFile('admin')]
