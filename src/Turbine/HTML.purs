module Turbine.HTML
  ( h1
  , div
  , span
  , input
  , button
  ) where

import Prelude (Unit, (<<<))
import Data.Hareactive (Behavior, Stream)
import Turbine (Component, class IsComponent, toComponent)
import Data.Function.Uncurried (Fn0, runFn0)

div :: forall a b. IsComponent a b => a -> Component Unit
div = _div <<< toComponent

foreign import _div :: forall a. Component a -> Component Unit

span :: forall a b. IsComponent a b => a -> Component Unit
span = _span <<< toComponent

foreign import _span :: forall a. Component a -> Component Unit

h1 :: forall a b. IsComponent a b => a -> Component Unit
h1 = _h1 <<< toComponent

foreign import _h1 :: forall a. Component a -> Component Unit

type InputOut = {inputValue :: Behavior String}

input :: Component InputOut
input = runFn0 _input

foreign import _input :: Fn0 (Component InputOut)

type ButtonOut = {click :: Stream Unit}

button :: String -> Component ButtonOut
button = _button

foreign import _button :: String -> Component ButtonOut

