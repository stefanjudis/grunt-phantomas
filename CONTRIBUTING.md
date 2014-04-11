# grunt-phantomas

You decided to contribute to this project? Great, thanks a lot for pushing it.
I really care about the coding style in this project and can be really picky to keep the project pretty. ;)

Before you make a pull request please check these points:

## Editor settings
- please set your editor to use two spaces
- remove spaces at line endings or empty lines
- make sure new files end with one empty line

## Coding style

#### I really like spaces, because I think they improve the readability a lot. Please try to keep that in mind.

Not desired:

```
if(a===b) {console.log('foo');}
```

Desired:

```
if ( a === b ) {
  console.log( 'foo' );
}
```

Not desired:

```
function(a,b,c){
  console.log('foo');
}
```

Desired:

```
function( a, b, c ) {
  console.log( 'foo' );
}
```

#### Please keep everything aligned.

Not desired:

```
a = {
  fooooooo: 'foo',
  bar: 'bar
}
```

Desired:

```
a = {
  foooooo : 'foo',
  bar     : 'bar
}
```

#### Functions are sorted alphabetically.

I know, that a lot of people do not agree with that. Never the less, I really like it and it helps me a lot. Please try to stick to it.


#### Please don't forget to add JSDoc to every new implemented function.

#### Please don't forget to check existing unit tests and/or implement new unit tests for new functionality.

#### Make sure your fork is passing at travis. You can check that also locally buy running 'grunt test'.