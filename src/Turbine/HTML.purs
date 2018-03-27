module Turbine.HTML
  ( h1
  ) where

import Prelude (Unit, (<<<))
import Turbine (Component, class IsComponent, toComponent)

h1 :: forall a b. IsComponent a b => a -> Component Unit
h1 a = _h1 (toComponent a)

foreign import _h1 :: forall a. Component a -> Component Unit
