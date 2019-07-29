# purescript-turbine

[![Turbine on Pursuit](https://pursuit.purescript.org/packages/purescript-turbine/badge)](https://pursuit.purescript.org/packages/purescript-turbine)
[![Build status](https://travis-ci.org/funkia/purescript-turbine.svg?branch=master)](https://travis-ci.org/funkia/purescript-turbine)

A purely functional library for building user interfaces powered by FRP.

* Based on higher-order FRP with support for continuous time.
* Concise and powerful thanks to FRP.
* No big global state/model. Everything is encapsulated in components.
* Type-safe communication between views and models.
* Model logic and view code is kept separate for logic-less views.
* Highly modular and composable thanks to encapsulated stateful components.
* Avoids using virtual DOM by utilizing FRP to make all changes to the DOM in reaction to changing behaviors.
* Easy to reason about thanks to tractable reactive data flow.

## Table of contents

* [Inline Examples](#inline-examples)
* [Examples](#examples)
* [Installation](#installation)
* [Documentation](#documentation)

## Inline Examples

### Single counter

![single counter GIF](examples/counters/single-counter.gif)

```purescript
counterModel { increment, decrement } init = do
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
counterModel { increment, decrement, delete } id = do
  let changes = (increment $> 1) <> (decrement $> -1)
  count <- sample $ scan (+) 0 changes
  pure { count, delete: delete $> id }

counterView { count } =
  H.div (
    H.text "Counter" </>
    H.span {} (H.textB $ map show count) </>
    H.button {} "+" `output` (\o -> { increment: o.click }) </>
    H.button {} "-" `output` (\o -> { decrement: o.click }) </>
    H.button {} "x" `output` (\o -> { delete: o.click })
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

## Examples

- [Email validator](/examples/email-validator) – A simple email validator.
- [Fahrenheit celsius converter](/examples/fahrenheit-celsius) – Conversion between fahrenheit and celsius.
- [Counters](/examples/counters) – A list of counters. This example shows how to create a dynamic list of components.
- [Continuous time](/examples/continuous-time) – A very simple example showing how to work with continuous time.
- [Timer](/examples/timer) – A more complicated example demonstrating continuous time by implementing a timer with a progress bar.
- [Zip codes](/examples/zip-codes) – A zip code validator. Shows how to perform `Effect`s using FRP.
- [TodoMVC](/examples/todomvc) – The classi TodoMVC example (with no routing yet).

## Installation

The following installs Hareactive and Turbine. Hareactive is the FRP library
that Turbine builds upon and is a hard dependency.

```
npm i @funkia/hareactive
bower install --save purescript-hareactive
npm i @funkia/turbine
bower install --save purescript-turbine
```

## Documentation

- [Tutorial](./docs/tutorial.md)
- [API documentation on Pursuit](https://pursuit.purescript.org/packages/purescript-turbine)
