# purescript-turbine

[![Turbine on Pursuit](https://pursuit.purescript.org/packages/purescript-turbine/badge)](https://pursuit.purescript.org/packages/purescript-turbine)
[![Build status](https://travis-ci.org/funkia/purescript-turbine.svg?branch=master)](https://travis-ci.org/funkia/purescript-turbine)

Turbine is a purely functional frontend framework powered by classic FRP.

* Concise and powerful thanks to FRP.
* No big global state/model. Everything is incapsulated in components.
* Type-safe communication between views and models.
* Model logic and view code is kept seperate for logic-less views.

## Table of contents

* [Examples](#examples)
* [Installation](#installation)
* [Tutorial](#tutorial)

## Examples

### Single counter

![single counter GIF](examples/counters/single-counter.gif)

```purescript
counterModel {increment, decrement} init = do
  let changes = (increment $> 1) <> (decrement $> -1)
  count <- scan (+) init changes
  pure { count }

counterView {count} =
  H.text "Counter " </>
  H.span (H.textB $ map show count) </>
  H.button "+" `output` (\o -> { increment: o.click }) </>
  H.button "-" `output` (\o -> { decrement: o.click })

counter = modelView counterModel counterView

main = runComponent "#mount" (counter 0)
```

### List of counters

Show a list of counters. New counters can be added to the list. Existing
counters can be deleted. The aggregated sum of all the counters is shown.

![list of counters GIF](examples/counters/list-counter.gif)

```purescript
counterModel {increment, decrement, delete} id = do
  let changes = (increment $> 1) <> (decrement $> -1)
  count <- sample $ scan (+) 0 changes
  pure { count, delete: delete $> id }

counterView {count} =
  H.div (
    H.text "Counter" </>
    H.span {} (H.textB $ map show count) </>
    H.button {} "+" `output` (\o -> {increment: o.click}) </>
    H.button {} "-" `output` (\o -> {decrement: o.click}) </>
    H.button {} "x" `output` (\o -> {delete: o.click})
  )

counter = modelView counterModel counterView

counterListModel {addCounter, listOut} init = do
  let sum = listOut >>= (map (_.count) >>> foldr (lift2 (+)) (pure 0))

  let removeId = map (fold <<< map (_.delete)) listOut
  let removeCounter = map (\i -> filter (i /= _)) (switchStream removeId)

  nextId <- sample $ scanS (+) 0 (addCounter $> 1)
  let appendCounter = cons <$> nextId

  counterIds <- sample $ scan ($) init (appendCounter <> removeCounter)
  pure {sum, counterIds}

counterListView { sum, counterIds } _ =
  H.div {} (
    H.h1 {} (H.text "Counters") </>
    H.span {} (H.textB (map (\n -> "Sum " <> show n) sum)) </>
    H.button {} (H.text "Add counter") `output` (\o -> { addCounter: o.click }) </>
    list (\id -> counter id `output` identity) counterIds identity `output` (\o -> { listOut: o })
  )

counterList = modelView counterListModel counterListView

main = runComponent "#mount" (counterList [0])
```

## Installation

The following installs Hareactive and Turbine. Hareactive is the FRP library
that Turbine builds upon and is a hard dependency.

```
npm i @funkia/hareactive
bower install --save purescript-hareactive
npm i @funkia/turbine
bower install --save purescript-turbine
```

## Tutorial

This is a hands-on tutorial in which we build a simple application. The core
concepts in Turbine are introduced along the way. Turbine is based on functional
reactive programming (FRP). In particular it uses the FRP library
Hareactive. This tutorial assumes no prior experience with FRP and hence it can
also be seen as an introduction to FRP.

If you want to you can follow along the tutorial yourself. You can do so by
cloning the Turbine starter template.

```
git clone https://github.com/funkia/purescript-turbine-starter turbine-tutorial
cd turbine-tutorial
npm i
```

You can then run `npm run build` and aftewards you should see the text "Hello,
world!" if you open the `index.html` file in a browser. Along the way you should
make changes to the file `src/Main.purs`.

### Component

The central type in Turbine is `Component`. A `Component` represents
a piece of user interface. For instance, that could be an input field or
a button. More concretely a `Component` is a description on how to create
a piece of HTML. Components are composable. Hence an input field and
a button can be composed together and the result is another component.
A Turbine application is "components all the way down".

The `Component` type has the following kind.

```
Component :: Type -> Type -> Type
```

That is, it is parameterized by two types. The purpose of those are explained
later.

### Creating simple HTML

Turbine contains functions for creating components that correspond to single
HTML elements. These live in the module `Turbine.HTML.Elements` which is
typically import qualified like this.

```purescript
import Turbine.HTML as H
```

For each HTML element the module exports a corresponding function.  For the
HTML element `div` there is a function `div`, for the `span` element there is a
`span` function, and so on. The first argument to these functions is a record
of attributes. If the HTML element supports children then the corresponding
function takes a second argument as well which is a component. Here are a few
examples.

```purescript
myInput = H.input { placeholder: "Write here", class: "form-input" }
myButton = H.button {} (H.text "Click me")
myDivWithButton = H.div { class: "div-class" } myButton
```

The `text` function used above takes a string an returns a component
corressponding to a text node of the string.

Components are composed together with the `</>` operator. As a first
approximation `</>` is similar to the semigroup operator `<>`. However, the
type of `</>` is slightly different as we will see later. Writing `component1
</> component2` creates a new component which represents the HTML from the
first component followed by the HTML for the second component. Here is an
example.

```purescript
const myLoginForm =
  H.input { placeholder: "Username" } </>
  H.input { placeholder: "Password" } </>
  H.label {} (H.text "Remember login") </>
  H.input { type: "checkbox" }
```

If you add the following to the code in `Main.purs` and change `Main` into the
following.

```diff
-app = H.text "Hello, world!"
+app = myLoginForm
```

Then you should see HTML corresponding to the following.

```html
<input placeholder="Username" />
<input placeholder="Password" />
<label>Remember login</label>
<input type="checkbox" />
```

By combining `</>` with the fact that the element function accept a child
component as their second argument we can create arbitrary HTML. Now, let us
create the HTML which we will use going forward.

```purescript
counterView = 
  H.div {} (
    H.text "Counter " </>
    H.span {} (H.text "0") </>
    H.button {} (H.text "+") </>
    H.button {} (H.text "-")
  )
```

Here we have hardcoded the value `0` into the user interface. The intended
outcome is that the displayed number is dynamic and increments every time the
`+` button is pressed and decrements every time the `-` button is pressed. But,
before we can implement that we need to learn a little bit of FRP.

### A short interlude on FRP

Functional reactive programming contains two key data-types `Behavior` and
`Stream`.

> Note: What we call `Stream` is often called `Event` in other FRP libraries.

A `Behavior` represents a value that changes over time. For instance, `Behavior
Number` represents a changing number and `Behavior String` represents a
changing string.

A `Stream` represents events or occurrences that happens at specific moments in
time.

The difference between behaviors and streams can be illustrated as below.

![illustration of behavior and stream](resources/behaviorstream.svg)

As the image indicates a behavior can be seen a function from time. That
is, at any specific moment in time it has a value. A stream on the other
hand only has values, or occurrences, at specific punctuations in time.

### Dynamic HTML

In the counter component above we hard-coded the value `0` into the view.
The goal is that the displayed number should _change over time_. And, as
mentioned, in FRP we use behaviors to represent values that change over
time. Thus, we parametize the HTML above such that it takes as agument
a record of a behavior of the type `Behavior Number`.

```purescript
counterView { count } = 
  H.div {} (
    H.text "Counter " </>
    H.span {} (H.textB (map show count)) </>
    H.button {} (H.text "+") </>
    H.button {} (H.text "-")
  )
```

We also changed `H.text "0"` into `H.textB (map show count)`. The `textB`
function is similar to `text` except that instead of taking an argument of
type `String` it takes an argument of type `Behavior String.` It then
returns a component that describes _dynamic HTML_. At any point in time
the value of the text node will have the same value as the behavior.

### Output

Recall that the `Component` type is parameterized by two types. The first
of these is called the components _selected output_ and the second is
called the _available output_.

### Model view

### List
