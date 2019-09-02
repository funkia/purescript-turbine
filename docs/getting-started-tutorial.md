# Getting started tutorial

This is a quick start tutorial which aims to explain the basics of Turbine as
briefly as possible.

Turbine is a fairly small library build on top of the FRP library Hareactive.
When learning Turbine the bulk of the work is actually to learn Hareactive and
FRP. This tutorial covers most of Turbine but only but only the essential types
in Hareactive and a small fraction of its API.

## A small Turbine app

The following code is a small complete Turbine app:

```purescript
import Hareactive.Combinators (accum)
import Turbine (Component, use, component, output, (</>), runComponent)
import Turbine.HTML as E

counter :: Component { count :: Behavior Int } {}
counter id = component \on -> do
  count <- accum (+) 0 (on.increment <> on.decrement)
  ( E.div { class: pure "wrapper" } (
      E.text "Counter " </>
      E.span {} (E.textB $ map show count) </>
      E.button {} (E.text "+" ) `use` (\o -> { incrememt: o.click $> 1 }) </>
      E.button {} (E.text "-" ) `use` (\o -> { decrement: o.click $> -1 })
    )
  ) `output` { count }

main = runComponent "#mount" app
```

The code creates an application that functions as shown in the GIF below.

![single counter GIF](/examples/counters/single-counter.gif)

This small example uses almost every important function in Turbine. Hence, by
explaining every detail of the example from top to bottom this tutorial covers
most of Turbine.

## The types

Let's first consider each of the types used in the example. The three key FRP
types from Hareactive all come into play:

* [Behavior](https://pursuit.purescript.org/packages/purescript-hareactive/docs/Hareactive.Types#t:Behavior):
  A `Behavior a` represents a value of type `a` that changes over time. In the
  example above `count` has the type `Behavior Int` because the count changes
  over time in response to the buttons.
* [Stream](https://pursuit.purescript.org/packages/purescript-hareactive/docs/Hareactive.Types#t:Stream):
  A `Stream a` represents events or occurrences that happens at specific
  moments in time. In the example, `increment` and `decrement` are streams
  created from the click events on each button.
* [Now](https://pursuit.purescript.org/packages/purescript-hareactive/docs/Hareactive.Types#t:Now).
  A `Now a` represents a computation that runs in an atomic moment of time,
  which has access to the current time, and which can have side-effects. A `Now
  a` is can be though of as equivalent to `Time -> Effect a`. In the example
  the function passed to `component` returns a `Now` hence the `do` makes the
  function run in the `Now`-monad.

The primary type which Turbine adds on top of Hareactive is
[Component](https://pursuit.purescript.org/packages/purescript-turbine/docs/Turbine#t:Component).
A component is an encapsulated description of a piece of user interface as well
as the logic and state controlling it. The `Component` type constructor takes
two type parameters. For instance, `counter` in the example is of the type:

```purescript
counter :: Component { count :: Behavior Int } {}
```

The first argument to `Component` is called the component's _available output_
and the second is called the component's _selected output_. Similarly to how
`Effect a` denotes a computation with side-effects that produces a value of
type `a` the type `Component a b` denotes a component that when constructed
produces two outputs, one of type `a` and one of type `b`. A component's
available output represents all the events and values that it exposes and the
selected output is the part of this which the user of the component has
explicitly declared interest in.

If you think of a DOM element, then the available output corresponds to all the
events that we _could_ listen to by calling `addEventListener` on the element
and the selected output corresponds to the things that we have already declared
interest in by calling `addEventListener` on the element.

## `component`

In the example `counter` is a component created with the `component` function.
A Turbine application is structured using comopnents and the `component`
function is the primary way to create custom components. It has the type:

```purecript
component :: forall a o p. (o -> Now (ComponentResult a o p)) -> Component p {}
```

Values of type `ComponentResult` are constructed with the `output` function:

```purescript
output :: forall a o p. Component a o -> p -> Now (ComponentResult a o p)
```

Hence, the function given to `component` essentially returns two values. A
component of type `Component a o` and a value of some type `p`. The function
then receives an argument of type `o`. Notice the recursive dependency: the
selected output of the returned component is passed as input to the function.

The selected output of the component returned in the example has the type `{
increment :: Stream Int, decrement :: Stream Int }`. These streams come from
the HTML view construct further down and they correspond to the click events
from each of the buttons. The `increment` stream has an occurrence with the
value `1` whenever the "+" button is pressed and the `decrement` stream has an
occurrence with the value `-1` whenever the "-" is pressed.

Streams are monoids and the expression `on.increment <> on.decrement` results
in a new streams that combines the occurrences of both streams.

We then apply `accum` to the combined streams: `accum (+) 0 (on.increment <>
on.decrement)`. The `accum` function can be though of as a "fold over time" and
it has a type that resembles that of `foldr`.

```purescript
accum :: forall a b. (a -> b -> b) -> b -> Stream a -> Now (Behavior b)
```

`accum` returns a value in the `Now` monad because whenever we accumulate state
over time the result depends on when we start accumulating. If you count how
many cars pass by a certain road starting from right now you are not going to
have the same count as someone who started counting yesterday. Hence, `accum`
returns a `Now` and the `Now` returned to `component` is run when the component
is constructed. Thus, our counter will begin accumulating right when it is
constructed. It starts with the initial value `0` (the second argument to
`accum`) and every time the stream has an occurrence `+` (the first argument to
`accum`) is applied to the current value and the value of the occurrence. The
result becomes the new current value.

As in the example below `component` is typically used following this pattern or
template:

```purecript
myComponent = component \on -> do
  // Logic/model
  ...
  // View
  view `output` { ... }
```

As indicated returned component is often called the componen's "view" and the
code above is called the component's "logic" or "model". The view can use
values defined in the model and the model can use selected output from the
view. This circular dependency arises naturally when using FRP to build UI.

## Building HTML

The next part of the example is the part that constructs the HTML for the
counter:

```purescript
E.div { class: pure "wrapper" } (
  E.text "Counter " </>
  E.span {} (E.textB $ map show count) </>
  E.button {} (E.text "+" ) `use` (\o -> { incrememt: o.click $> 1 }) </>
  E.button {} (E.text "-" ) `use` (\o -> { decrement: o.click $> -1 })
)
```

The module `Turbine.HTML` contains element functions for creating components
that correspond to HTML elements. These takes a record of attributes and a
child component---except in cases when a HTML doesn't support one or both of
those things.

As mentioned, in FRP behaviors are used to represent values that change over
time. To support creating HTML that change over time behaviors can be given to
the element functions. Since we want the outer `div` to constantly have the
class `wrapper` we use `pure "wrapper"` which creates a constant behavior.

The function `textB` has the type `Behavior String -> Component {} {}`. It
takes a behavior and returns a component which creates a text node that changes
its content as the given behavior changes. Therefore the expression `E.textB
count` creates a text node that always shows the current count.

Components are composed with the  `merge` function, used as its `</>` operator.
The expression `a </> b` is a new component which creates the HTML from `a`
followed by the HTML from `b`. `merge` has the type:

```purescript
merge :: forall a o b p q. Union o p q => Component a { | o } -> Component b { | p } -> Component {} { | q }
```

From the constraint `Union o p q` the PureScript compiler infers `q` to be the
union of `o` and `p`. This means that when combining two components `merge`
throws away the two component's available output (notice how `a` and `b` does
not appear in the return type) and it combines the two component's selected
output as the selected output of the resulting component. Hence, when composing
components their selected output propagates out into the final component while
the available output it discarded.

If, for some component, we want to use parts of its available output we apply
the `use` function. This function copies output from the available part into
the selected part. It has the type:

```purescript
use :: forall a o p q. Union o p q => Component a { | o } -> (a -> { | p }) -> Component {} { | q }
```

In other words, `use` takes a component and a function. The component's
available output is passed to the function which must return a record. A new
component is returned with its selected output being the union of the existing
selected output and what the function returned.

We are now equipped with the knowledge necessary to understand this part of the
example:

```purescript
E.button {} (E.text "+" ) `use` (\o -> { incrememt: o.click $> 1 }) </>
E.button {} (E.text "-" ) `use` (\o -> { decrement: o.click $> -1 })
```

The expression `E.button {} (E.text "+")` has the type `Compenent { click ::
Stream ClickEvent, ... } {}`. In other words, a stream of click events is part
of the available output from a button. For each of the buttons we apply `use`
to select the click stream first with the property name `increment` and then
with the property name `decrement`. Streams are functors and we use `$>` to
turn the value of each event or occurrence into 1 and -1 respectively. Finally,
we compose the two components with `</>` and the resulting type of the above
becomes:

```purescript
Component { increment :: Stream Int, decrement :: Stream Int } {}
```

This composed component is then given as the child component to the `div` function:

```
div :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component Output o
```

Notice how the `div` function propagates the selected output of its child into
the selected output of the returned component. All the element functions behave
in this way and, combined with how `</>` works, this ensures that selected
output always "bubbles up" when HTML is constructed. The final component passed
to `output` therefore has the selected output `{ increment :: Stream Int,
decrement :: Stream Int } {}` and this gets passed as input to the function
given to `component`. We have come full circle.

## Running the application

The last line calls `runComponent` which has the type:

```purescript
runComponent :: forall a o. String -> Component a o -> Effect Unit
```

The function takes a [CSS selector
string](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) and a
component. It then runs the component with the first element matching the
selector as its parent. Similarly to how `Effect` _describes_ side-effects a
`Component` only describes a piece of UI or a part of an application. A Turbine
application always has an invocation of `runComponent` which then runs the
entire application.
