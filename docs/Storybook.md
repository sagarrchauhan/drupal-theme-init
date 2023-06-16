# Storybook with SDC!

In the current implementation of storybook with Drupal alongside SDC, there is a limitation of the storybook with respect to the installion of it. It can only be installed within the Root of the Drupal Repo. Hence, the theme generator will not be able to handle SDC.

However, there are certain steps independant of the theme generator, which will help in setting up Storybook in its current form and still be accessed.  

## Drupal part
Assuming an installation of Drupal 10.1 or later and SDC is enabled with Drupal Theme init, install CL Server module:
```
composer require "drupal/cl_server:^2.0.0@beta"
drush pm:enable --yes cl_server
```
In **settings.local.php**, add the following code:
```
# Disable caches during development. This allows finding new components without clearing caches.
$settings['cache']['bins']['discovery'] = 'cache.backend.null';
# Then disallow exporting config for 'cl_server'. Instructions are at the bottom of the file.
$settings['config_exclude_modules'] = ['devel', 'stage_file_proxy', 'cl_server'];
```
Setup **development.services.yml** for CORS:
```
parameters:
  # ...
  twig.config:
    debug: true
    cache: false
  cors.config:
    enabled: true
    allowedHeaders: ['*']
    allowedMethods: []
    allowedOrigins: ['*']
    exposedHeaders: false
    maxAge: false
    supportsCredentials: true
services:
  # ...
```
Rebuild the Drupal Cache:

`drush cache:rebuild`
 
## Storybook part

Now it's time to install Storybook. You'll need yarn or npm. Before you can install anything you'll need to do initialize the **package.json**.

```
{
  "name": "some-title",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@lullabot/storybook-drupal-addon": "^2.0.1",
    "@storybook/addon-essentials": "^7.0.21",
    "@storybook/addon-links": "^7.0.21",
    "@storybook/blocks": "^7.0.21",
    "@storybook/server": "^7.0.21",
    "@storybook/server-webpack5": "^7.0.21",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "storybook": "^7.0.21"
  }
}
```
 - Do a yarn/npm install.
 - Add the following to the **main.js** inside .storybook folder in the root.
 ```
 const config = {
    stories: ["../web/themes/**/*.stories.@(mdx|json|yml)"],
    addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@lullabot/storybook-drupal-addon"],
    framework: {
      name: "@storybook/server-webpack5",
      options: {},
    },
    docs: {
      autodocs: "tag",
    },
    core: {
      builder: '@storybook/builder-webpack5'
    }
 };
 
export default config;
```

- Add the following to **preview.js** inside the .storybook folder in the root. Add the required extra themes that needs to be previewed in Storybook. Replace the placeholders below with required values.
```
const preview = {
  globals: {
    drupalTheme: 'my_theme', // Replace this with your default custom theme
    supportedDrupalThemes: {
      my_theme: {title: 'My Theme'}, // // Replace this with your default custom theme
      claro: {title: 'Claro'},
      olivero: {title: 'Olivero'},
    },
  },
  parameters: {
    server: {
      // Replace this with your Drupal site URL, or an environment variable.
      url: 'http://mysite.lndo.site',
    },
    // ...
  },
};

export default preview;
```
- Build the storybook with the command available in **package.json**. 
```
npm run storybook
OR
yarn storybook
```
- Storybook will start in http://localhost:6006. This can also be configured in lando to have something like `http://mysite.lndo.site:6006`.
-  You will see another error. This is a 403 because you need to allow the CL Server render endpoint for the anonymous user. So you need to go to the Drupal permissions page and grant permission to the anonymous user to access the component rendering endpoint. Note that this permission will not be exported into configuration because you excluded cl_server above in **settings.local.php**.
- Now you can restart the Storybook server. Kill the storybook process and run it again.
