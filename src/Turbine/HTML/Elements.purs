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
  , section
  , section_
  , header
  , header_
  , class Subrow
  ) where

import Prelude hiding (div)

import Data.Function.Uncurried (Fn2, Fn1, runFn1, runFn2)
import Hareactive (Behavior, Stream)
import Prim.Row (class Union)
import Turbine (Component)
import Type.Row (type (+))
import Web.Event.Event (Event)
import Web.UIEvent.KeyboardEvent (KeyboardEvent)

class Subrow (r :: # Type) (s :: # Type)

instance subrow :: Union r t s => Subrow r s

-- Elements

type Attributes' r =
  ( class :: Behavior String
  , id :: Behavior String
  | r
  )

type Attributes = Attributes' ()

div :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o o
div = runFn2 _div

div_ :: forall o p. Component o p -> Component o o
div_ = div {}

foreign import _div :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o o)

span :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o o
span = runFn2 _span

span_ :: forall o p. Component o p -> Component o o
span_ = span {}

foreign import _span :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o o)

p :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o o
p = runFn2 _p

p_ :: forall o p. Component o p -> Component o o
p_ = p {}

foreign import _p :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o o)

h1 :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o o
h1 = runFn2 _h1

h1_ :: forall o p. Component o p -> Component o o
h1_ = h1 {}

foreign import _h1 :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o o)

label :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o o
label = runFn2 _label

label_ :: forall o p. Component o p -> Component o o
label_ = label {}

foreign import _label :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o o)

section :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o o
section = runFn2 _section

section_ :: forall o p. Component o p -> Component o o
section_ = section {}

foreign import _section :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o o)

header :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o o
header = runFn2 _header

header_ :: forall o p. Component o p -> Component o o
header_ = header {}

foreign import _header :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o o)

type ButtonOut = { click :: Stream Unit }

button :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o ButtonOut
button = runFn2 _button

button_ :: forall o p. Component o p -> Component o ButtonOut
button_ = button {}

foreign import _button :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o ButtonOut)

a :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o o
a = runFn2 _a

a_ :: forall o p. Component o p -> Component o o
a_ = a {}

foreign import _a :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o o)

type InputAttrs' r =
  ( placeholder :: Behavior String
  , value :: Behavior String
  , autofocus :: Behavior Boolean
  | Attributes' + r)

type InputAttrs = InputAttrs' ()

type InputOut =
  { inputValue :: Behavior String
  , input :: Stream Event
  , keyup :: Stream KeyboardEvent
  }

input :: forall a. Subrow a InputAttrs => Record a -> Component {} InputOut
input = runFn1 _input

input_ :: Component {} InputOut
input_ = input {}

foreign import _input :: forall a. Subrow a InputAttrs => Fn1 (Record a) (Component {} InputOut)

text :: String -> Component {} Unit
text = _text

foreign import _text :: String -> Component {} Unit

textB :: Behavior String -> Component {} Unit
textB = _textB

foreign import _textB :: Behavior String -> Component {} Unit

foreign import br :: Component {} Unit

