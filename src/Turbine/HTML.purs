module Turbine.HTML
  ( h1
  , div
  , span
  ) where

import Prelude (Unit, (<<<))
import Hareactive (Behavior)
import Turbine (Component, class IsComponent, toComponent)

div :: forall a b. IsComponent a b => a -> Component Unit
div = _div <<< toComponent

foreign import _div :: forall a. Component a -> Component Unit

span :: forall a b. IsComponent a b => a -> Component Unit
span = _span <<< toComponent

foreign import _span :: forall a. Component a -> Component Unit

h1 :: forall a b. IsComponent a b => a -> Component Unit
h1 = _h1 <<< toComponent

foreign import _h1 :: forall a. Component a -> Component Unit

type InputOut = {text: Behavior String}

input :: forall a b. IsComponent a b => a -> Component Input
input = _input <<< toComponent

foreign import _input :: forall a. Component a -> Component Unit
