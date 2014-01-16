# grunt-phantomas

[![Build Status](https://travis-ci.org/stefanjudis/grunt-phantomas.png?branch=master)](https://travis-ci.org/stefanjudis/grunt-phantomas) [![NPM version](https://badge.fury.io/js/grunt-phantomas.png)](http://badge.fury.io/js/grunt-phantomas) [![Dependency Status](https://gemnasium.com/stefanjudis/grunt-phantomas.png)](https://gemnasium.com/stefanjudis/grunt-phantomas) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

> Grunt plugin for phantomas

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-phantomas --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-phantomas');
```

## The "phantomas" task
You're looking for a tool that gives you detailed metrics about your site? Great!!!
This grunt plugin executes [phantomas](https://github.com/macbre/phantomas) for you and visualizes the returned metrics in a generated `index.html` for you. It will keep track of history, so that you can set it up and check reports after every deployment of your site.

Examples of rendered output:
- metrics for [http://gruntjs.com](http://gruntjs.com) -> [here](http://stefanjudis.github.io/grunt-phantomas/gruntjs/)

*I'm still at early stage, but I think you can already work with it.* ;)

### Overview
In your project's Gruntfile, add a section named `phantomas` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig( {
  phantomas: {
    gruntSite : {
      options : {
        indexPath : './phantomas/',
        options   : {},
        url       : 'http://gruntjs.com/'
      }
    }
  }
} )
```

### Options

#### options.indexPath
Type: `String`
Default value: `./phantomas/`

A string value that represents the relative path to the place where `phantomas` will render your metrics. Inside of this folder an `index.html`, a data folder and an assets folder will be created.

#### options.numberOfRuns
Type: 'Number'
Default value: `5`

A numeric value that represents the number of times the `phantomas` executable will be started. The more times it runs the more reliable metrics become.

#### options.options
Type: `Object`
Default value: `{}`

An array that represents possible options for `phantomas` executable. For more information please check [the official api documentation](https://github.com/macbre/phantomas/wiki/npm-module) and [list of possible parameters](https://github.com/macbre/phantomas). See usage examples later on.

#### options.url
Type: `String`
Default value: `http://gruntjs.com/`

A string value that represents the url of the site, which will be analyzed by `phantomas`.

### Usage Examples

#### Default Options
In this example, the default options are used to fetch metrics of `http://gruntjs.com` and render the visualized metrics at `./phantomas`.

```js
grunt.initConfig({
  phantomas: {
  	yourSite: {}
  }
});
```

#### Custom Options
In this example, custom options are used to fetch metrice of `http://yoursite.com` and render the visualized metrics at `./yoursite/`.

```js
grunt.initConfig( {
  phantomas: {
    yourSite : {
      options : {
        indexPath    : './yoursite/',
        url          : 'http://yoursite.com/',
        numberOfRuns : 10
      }
    }
  }
} );
```

#### Phantomas options
In this example, the phantomas option is used to set `phantomas` execution parameters. In this case all external script except the defined ones are blocked by `phantomas`, what can become really handy, when dealing with a lot of third party scripts that influence your site performance.
```js
grunt.initConfig( {
  phantomas: {
    yourSite : {
      options : {
        indexPath : './yoursite/',
        options   : {
          'no-externals' : true,
          'allow-domain' : 'cdn.yoursite.com.br,ajax.googleapis.com'
        },
        url       : 'http://yoursite.com'
      }
    }
  }
} );
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
Please check release history at [Github](https://github.com/stefanjudis/grunt-phantomas/releases). :)


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/stefanjudis/grunt-phantomas/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

