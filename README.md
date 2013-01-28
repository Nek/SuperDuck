# ATTENTION. WORK IN PROGRESS. 

Though the destructuring is done and works well.

# Super Duck

Destructuring, matching and multimethods.

## Getting Started
### On the server
Install the module with: `npm install superduck`

```javascript
var superduck = require('superduck');
superduck.awesome(); // "awesome"
```

### In the browser
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/nek/superduck/master/dist/superduck.min.js
[max]: https://raw.github.com/nek/superduck/master/dist/superduck.js

In your web page:

```html
<script src="dist/superduck.min.js"></script>
<script>
awesome(); // "awesome"
</script>
```

In your code, you can attach superduck's methods to any object.

```html
<script>
this.exports = Bocoup.utils;
</script>
<script src="dist/superduck.min.js"></script>
<script>
Bocoup.utils.awesome(); // "awesome"
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Nek  
Licensed under the MIT license.
