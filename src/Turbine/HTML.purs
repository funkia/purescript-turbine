module Turbine.HTML
  ( h1
  , div
  , br
  , text
  , textB
  , span
  , input
  , button
  ) where

import Prelude (Unit, (<<<))
import Data.Hareactive (Behavior, Stream)
import Turbine (Component)
import Data.Function.Uncurried (Fn0, runFn0)

div :: forall a o. Component o a -> Component o o
div = _div

foreign import _div :: forall a o. Component o a -> Component o o

span :: forall a o. Component o a -> Component o o
span = _span

foreign import _span :: forall a o. Component o a -> Component o o

h1 :: forall a o. Component o a -> Component o Unit
h1 = _h1

foreign import _h1 :: forall a o. Component o a -> Component o Unit

a :: forall a o. Component o a -> Component o Unit
a = _a

text :: String -> Component {} Unit
text = _text

foreign import _text :: String -> Component {} Unit

textB :: forall a. Behavior String -> Component {} Unit
textB = _textB

foreign import _textB :: Behavior String -> Component {} Unit

foreign import _a :: forall a o. Component o a -> Component o Unit

foreign import br :: Component {} Unit

type InputOut = {inputValue :: Behavior String}

input :: Component {} InputOut
input = runFn0 _input

foreign import _input :: Fn0 (Component {} InputOut)

type ButtonOut = {click :: Stream Unit}

button :: String -> Component {} ButtonOut
button = _button

foreign import _button :: String -> Component {} ButtonOut

