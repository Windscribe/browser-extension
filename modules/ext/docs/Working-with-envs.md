# Ext Envs

## Env Prefixes

The extensions environment variables are split into three different groups. development, testing, deployment. Each group uses it's own prefix.

- WEB_EXT
- TEST
- DEPLOY

### WEB_EXT

The `WEB_EXT` prefix is for any environment variable that the extension will bundle into it's codebase. These are automatically included and bundled into the extension.

Please be aware that **all** variables prepended with `WEB_EXT` are bundled. Whether or not they are actually used. Just to be safe, we recommend you take care when using `WEB_EXT`

### TEST

The `TEST` prefix references all environment variable used in a testing environment

### DEPLOY

The `DEPLOY` prefix references all environment variable used in a testing environment

## Env Files

Like the prefixes each environment has its own file. Each has a sample you can check out. In the root of the Extension codebase exists 3 schema files. `.env.schema`, `.deployment.schema.env`, and `.testing.schema.env` the naming should be self explanatory. But for reference

- .env references all variables used for the extension (Mostly developer envs)
- .testing.env references all variables used by the test runner
- .deployment.env references all the variables used by the deployment script.

These get loaded by `scripts` in the `package.json` file so there's no "setup" per say. Just need to copy the `.schema` files (removing the `.schema`), fill them in and run your scripts!

But for reference here's what scripts use which envs

- "start" -> .env
- "test:(e2e, unit, logic, all)" -> .testing.env
- "deployment" -> .deployment.env
