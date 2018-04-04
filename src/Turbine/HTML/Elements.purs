module Turbine.HTML.Elements
  ( h1
  , div
  , div_
  , br
  , text
  , textB
  , span
  , input
  , button
  ) where

import Data.Foldable (foldr)
import Data.Function.Uncurried (Fn0, Fn2, Fn3, runFn0, runFn2, runFn3)
import Data.Hareactive (Behavior, Stream)
import Prelude (Unit, (<<<))
import Turbine (Component)
import Turbine.HTML.Properties (Properties, Property(..))

foreign import data JSProps :: Type

processProp :: Property -> JSProps -> JSProps
processProp p props = case p of
  Attribute n m -> runFn3 handleAttribute n m props
  Class n -> runFn2 handleClass n props

processProps :: Properties -> JSProps
processProps = foldr processProp (runFn0 mkProps)

-- These `handle*` functions actually mutate the `JSProps` argument. Oh well.

foreign import mkProps :: Fn0 JSProps

foreign import handleAttribute :: Fn3 String String JSProps JSProps

foreign import handleClass :: Fn2 String JSProps JSProps

div :: forall a o. Properties -> Component o a -> Component o o
div = runFn2 _div <<< processProps

div_ :: forall a o. Component o a -> Component o o
div_ = runFn2 _div (runFn0 mkProps)

foreign import _div :: forall a o. Fn2 JSProps (Component o a) (Component o o)

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

textB :: Behavior String -> Component {} Unit
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

