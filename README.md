SystemJS + ASP.NET Core Example
================================

Experiment project configuration using TypeScript + SystemJS + JSPM for
modular scripting with multiple (e.g. per-page) entry points.


Debugging
---------

1. Install [NodeJS + npm][nodejs] and the [.NET Core SDK][dotnet]
1. Change to the `src\Web` directory
1. Run `dotnet restore` to restore .NET Core depencencies
1. Set the `ASPNETCORE_ENVIRONMENT` environment variable to `Development` to run the app in development mode
1. Run `dotnet run` to start the .NET Core debug web server
1. Run `npm install` to restore NPM, JSPM and @types dependencies
1. Run `npm run watch` to start the debug typescript compile, which automatically
   watches for changes

[nodejs]: https://nodejs.org/
[dotnet]: https://www.microsoft.com/net/core#windows


Packaging
---------

Run `dotnet package`. This is configured to also invoke `npm run build`, which
generates an optimized 'release' build of your TypeScript code.

Run `dotnet run` with `ASPNETCORE_ENVIRONMENT` set to `Production` to run with the app
in "production" mode.


Application Layout
------------------

All application code is written in TypeScript, files are in the `Scripts/`
directory.

All scripts are compiled for use with an AMD module loader.
See `tsconfig.json` for the TypeScript configuration.

1. In a `Development` release, scripts are loaded dynamically using SystemJS. This
   includes library dependencies.

1. In a `Production` release, an additional optimization step generates a single
   all-in-one script which contains:

   - Any library dependencies
   - Your application code

   The SystemJS loader is still required to load this application bundle.

   See **optimize.js** section below for further explanation.

Take a look at `Views/Shared/_Layout.cshtml` to see how these scripts are included.
In this project we are using the new Razor `environment` tag helper, but you can
achieve the same effect in older versions of Razor with an `@if (Debug)` statment.


SystemJS Configuration
-----------------------

See `wwwroot/js/_jspm.config.js` for the SystemJS configuration. This file contains
some custom configuration, but is maintained by the `jspm` command-line tool. All
libraries are be mapped to their physical location in the `wwwroot/js/jspm_packages`
directory in this file.

This single file is used by SystemJS to dynamically locate dependencies at dev
time, and by the `optimize.js` script at build time to generate the optimized build.


optimize.js
-----------

This Node script configures and invokes the `systemjs-builder` tool. It works by
scanning for all `.ts` files within the `Scripts/` directory and including
those files in the optimized script. Any dependencies those files have are also
included automatically.

For example, given the following TypeScript modules and their dependencies:

- `util`
- `init`
- `pages/home/index`
    - `react` (library)
    - `react-dom` (library)
    - `util`
    - `init`
- `pages/about/index`
    - `init`

The optimized script will include the following:

- `react` (library)
- `react-dom` (library)
- `init`
- `util`
- `pages/home/index`
- `pages/about/index`


Refrencing a script from a View
-------------------------------

Add a `System.import` call to any page/view in order to load and run a script:

```html
@section scripts {
    <script>System.import('pages/home/index')</script>
}
```

A pattern for injecting arguments into a "page" script is to export
a function from the page module.

For example:

```typescript
// pages/about/index.ts
import {onready} from 'init';

export function init(name: string) {
    onready(() => alert(`Hello, ${name}`));
}
```

```html
<!-- Views/Home/About.cshtml -->
@section scripts {
    <script>
        System.import('pages/about/index').then(function (about) {
            about.init('@Model.Name');
        });
    </script>
}
```
