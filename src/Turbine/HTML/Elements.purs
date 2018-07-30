module Turbine.HTML.Elements
  ( h1
  , h1_
  , div
  , div_
  , br
  , p
  , p_
  , text
  , textB
  , span
  , span_
  , input
  , input_
  , button
  , button_
  , label
  , label_
  ) where

import Web.Event.Event (Event)
import Data.Foldable (foldr)
import Data.Function.Uncurried (Fn0, Fn2, Fn3, Fn1, runFn0, runFn1, runFn2, runFn3)
import Hareactive (Behavior, Stream)
import Prelude (Unit, (<<<))
import Turbine (Component)
import Turbine.HTML.Properties (Properties, Property(..), toValue)

foreign import data JSProps :: Type

processProp :: Property -> JSProps -> JSProps
processProp prop props = case prop of
  Attribute n m -> runFn3 handleAttribute n (toValue m) props
  Class n -> runFn2 handleClass (toValue n) props

processProps :: Properties -> JSProps
processProps = foldr processProp (runFn0 mkProps)

-- These `handle*` functions actually mutate the `JSProps` argument. Oh well.

foreign import mkProps :: Fn0 JSProps

foreign import noProps :: JSProps

foreign import handleAttribute :: Fn3 String (Behavior String) JSProps JSProps

foreign import handleClass :: Fn2 (Behavior String) JSProps JSProps

div :: forall a o. Properties -> Component o a -> Component o o
div = runFn2 _div <<< processProps

div_ :: forall a o. Component o a -> Component o o
div_ = runFn2 _div noProps

foreign import _div :: forall a o. Fn2 JSProps (Component o a) (Component o o)

span :: forall a o. Properties -> Component o a -> Component o o
span = runFn2 _span <<< processProps

span_ :: forall a o. Component o a -> Component o o
span_ = runFn2 _span (runFn0 mkProps)

foreign import _span :: forall a o. Fn2 JSProps (Component o a) (Component o o)

p :: forall a o. Properties -> Component o a -> Component o o
p = runFn2 _p <<< processProps

p_ :: forall a o. Component o a -> Component o o
p_ = runFn2 _p (runFn0 mkProps)

foreign import _p :: forall a o. Fn2 JSProps (Component o a) (Component o o)

h1 :: forall a o. Properties -> Component o a -> Component o {}
h1 = runFn2 _h1 <<< processProps

h1_ :: forall a o. Component o a -> Component o {}
h1_ = runFn2 _h1 (runFn0 mkProps)

foreign import _h1 :: forall a o. Fn2 JSProps (Component o a) (Component o {})

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

type InputOut =
  { inputValue :: Behavior String
  , input :: Stream Event
  }

input :: Properties -> Component {} InputOut
input = runFn1 _input <<< processProps

input_ :: Component {} InputOut
input_ = runFn1 _input (runFn0 mkProps)

foreign import _input :: Fn1 JSProps (Component {} InputOut)

type ButtonOut = {click :: Stream Unit}

button :: forall o a. Properties -> Component o a -> Component o ButtonOut
button = runFn2 _button <<< processProps

button_ :: forall o a. Component o a -> Component o ButtonOut
button_ = runFn2 _button (runFn0 mkProps)

foreign import _button :: forall o a. Fn2 JSProps (Component o a) (Component o ButtonOut)

label :: forall o a. Properties -> Component o a -> Component o {}
label = runFn2 _label <<< processProps

label_ :: forall o a. Component o a -> Component o {}
label_ = runFn2 _label (runFn0 mkProps)

foreign import _label :: forall o a. Fn2 JSProps (Component o a) (Component o {})