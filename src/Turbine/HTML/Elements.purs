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
  , class Subrow
  ) where

import Prelude

import Data.Function.Uncurried (Fn2, Fn1, runFn1, runFn2)
import Data.Symbol (class IsSymbol, SProxy(SProxy))
import Hareactive (Behavior, Stream)
import Prim.Row (class Union)
import Prim.Row as Row
import Prim.RowList as RL
import Record as R
import Record.Builder (Builder)
import Record.Builder as Builder
import Turbine (Component)
import Type.Data.RowList (RLProxy(RLProxy))
import Web.Event.Event (Event)

class Subrow (r :: # Type) (s :: # Type)

instance subrow :: Union r t s => Subrow r s

mapHeterogenousRecord :: forall row xs f row'
   . RL.RowToList row xs
  => MapRecord xs row f () row'
  => (forall a. a -> f a)
  -> Record row
  -> Record row'
mapHeterogenousRecord f r = Builder.build builder {}
  where
    builder = mapRecordBuilder (RLProxy :: RLProxy xs) f r

class MapRecord (xs :: RL.RowList) (row :: # Type) f (from :: # Type) (to :: # Type)
  | xs -> row f from to where
  mapRecordBuilder :: RLProxy xs -> (forall a. a -> f a) -> Record row -> Builder { | from } { | to }

instance mapRecordCons ::
  ( IsSymbol name
  , Row.Cons name a trash row
  , MapRecord tail row f from from'
  , Row.Lacks name from'
  , Row.Cons name (f a) from' to
  ) => MapRecord (RL.Cons name a tail) row f from to where
  mapRecordBuilder _ f r =
    first <<< rest
    where
      nameP = SProxy :: SProxy name
      val = f $ R.get nameP r
      rest = mapRecordBuilder (RLProxy :: RLProxy tail) f r
      first = Builder.insert nameP val

instance mapRecordNil :: MapRecord RL.Nil row f () () where
  mapRecordBuilder _ _ _ = identity

-- Elements

type Attributes =
  ( class :: Behavior String
  , id :: Behavior String
  )

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

type InputAttrs =
  ( placeholder :: Behavior String
  , value :: Behavior String
  )

type InputOut =
  { inputValue :: Behavior String
  , input :: Stream Event
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

