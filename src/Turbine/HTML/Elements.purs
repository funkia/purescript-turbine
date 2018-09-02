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
  , ul
  , ul_
  , li
  , li_
  , span
  , span_
  , input
  , input_
  , textarea
  , textarea_
  , checkbox
  , checkbox_
  , button
  , button_
  , label
  , label_
  , section
  , section_
  , header
  , header_
  , footer
  , footer_
  , class Subrow
  , class RecordOf
  , class RecordOfGo
  , toArray
  , toArrayGo
  , ClassDescription
  , ClassElement
  , staticClass
  , toggleClass
  , dynamicClass
  ) where

import Prelude hiding (div)

import Data.Function.Uncurried (Fn2, Fn1, runFn1, runFn2)
import Data.Symbol (class IsSymbol, SProxy(..))
import Hareactive.Types (Behavior, Stream)
import Prim.Row (class Union)
import Prim.Row as Row
import Prim.RowList as RL
import Record as R
import Turbine (Component)
import Type.Data.RowList (RLProxy(..))
import Type.Row (type (+))
import Web.Event.Event (Event)
import Web.UIEvent.FocusEvent (FocusEvent)
import Web.UIEvent.KeyboardEvent (KeyboardEvent)
import Web.UIEvent.InputEvent (InputEvent)

class Subrow (r :: # Type) (s :: # Type)

instance subrow :: Union r t s => Subrow r s

class RecordOfGo (xs :: RL.RowList) (row :: # Type) a | xs -> row a where
  toArrayGo :: RLProxy xs -> Record row -> Array a

instance recordOfConsGo ::
  ( IsSymbol name -- Name should be a symbol
  , RL.RowToList row rx
  , Row.Cons name a trash row
  , RecordOfGo xs' row a -- Recursive invocation
  ) => RecordOfGo (RL.Cons name a xs') row a where
  toArrayGo _ rec = [val] <> (toArrayGo rest rec)
    where
      nameP = SProxy :: SProxy name
      rest = (RLProxy :: RLProxy xs')
      val = R.get nameP rec

instance recordOfNilGo :: RecordOfGo RL.Nil row a where
  toArrayGo _ _ = []

class RecordOf a (row :: # Type) | row -> a where
  toArray :: forall xs. RL.RowToList row xs => RecordOfGo xs row a => { | row } -> Array a

instance recordOf ::
  ( RL.RowToList row xs
  , RecordOfGo xs row a
  ) => RecordOf a row where
  toArray = toArrayGo (RLProxy :: RLProxy xs)

foreign import data ClassElement :: Type

newtype ClassDescription = ClassDescription (Array ClassElement)

foreign import staticClass :: String -> ClassDescription

foreign import toggleClass :: forall r. RecordOf (Behavior Boolean) r => { | r } -> ClassDescription

foreign import dynamicClass :: forall r. RecordOf (Behavior String) r => { | r } -> ClassDescription

derive newtype instance semigroupClassDescription :: Semigroup ClassDescription

-- Elements

type Attributes' r =
  ( class :: ClassDescription
  , id :: Behavior String
  | r
  )

type Attributes = Attributes' ()

type Output' r =
  ( click :: Stream Unit
  , dblclick :: Stream Unit
  , keydown :: Stream KeyboardEvent
  , keyup :: Stream KeyboardEvent
  , blur :: Stream FocusEvent
  | r
  )

type Output = Record (Output' ())

div :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
div = runFn2 _div

div_ :: forall o p. Component o p -> Component o Output
div_ = div {}

foreign import _div :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

ul :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
ul = runFn2 _ul

ul_ :: forall o p. Component o p -> Component o Output
ul_ = ul {}

foreign import _ul :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

li :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
li = runFn2 _li

li_ :: forall o p. Component o p -> Component o Output
li_ = li {}

foreign import _li :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

span :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
span = runFn2 _span

span_ :: forall o p. Component o p -> Component o Output
span_ = span {}

foreign import _span :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

p :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
p = runFn2 _p

p_ :: forall o p. Component o p -> Component o Output
p_ = p {}

foreign import _p :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

h1 :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
h1 = runFn2 _h1

h1_ :: forall o p. Component o p -> Component o Output
h1_ = h1 {}

foreign import _h1 :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

label :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
label = runFn2 _label

label_ :: forall o p. Component o p -> Component o Output
label_ = label {}

foreign import _label :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

section :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
section = runFn2 _section

section_ :: forall o p. Component o p -> Component o Output
section_ = section {}

foreign import _section :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

header :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
header = runFn2 _header

header_ :: forall o p. Component o p -> Component o Output
header_ = header {}

foreign import _header :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

footer :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
footer = runFn2 _footer

footer_ :: forall o p. Component o p -> Component o Output
footer_ = footer {}

foreign import _footer :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

type ButtonOut = { click :: Stream Unit }

button :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o ButtonOut
button = runFn2 _button

button_ :: forall o p. Component o p -> Component o ButtonOut
button_ = button {}

foreign import _button :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o ButtonOut)

a :: forall a o p. Subrow a Attributes => Record a -> Component o p -> Component o Output
a = runFn2 _a

a_ :: forall o p. Component o p -> Component o Output
a_ = a {}

foreign import _a :: forall a o p. Subrow a Attributes => Fn2 (Record a) (Component o p) (Component o Output)

type InputAttrs' r =
  ( placeholder :: Behavior String
  , value :: Behavior String
  , autofocus :: Behavior Boolean
  | Attributes' + r
  )

type InputAttrs = InputAttrs' ()

type InputOut' r =
  ( inputValue :: Behavior String
  , input :: Stream InputEvent
  , keyup :: Stream KeyboardEvent
  | Output' + r
  )

type InputOut = Record (InputOut' ())

input :: forall a. Subrow a InputAttrs => Record a -> Component {} InputOut
input = runFn1 _input

input_ :: Component {} InputOut
input_ = input {}

foreign import _input :: forall a. Subrow a InputAttrs => Fn1 (Record a) (Component {} InputOut)

type TextareaAttrs' r =
  ( rows :: Behavior Int
  , cols :: Behavior Int
  | InputAttrs' + r
  )

type TextareaAttrs = TextareaAttrs' ()

textarea :: forall a. Subrow a TextareaAttrs => Record a -> Component {} InputOut
textarea = runFn1 _textarea

textarea_ :: Component {} InputOut
textarea_ = textarea {}

foreign import _textarea :: forall a. Subrow a TextareaAttrs => Fn1 (Record a) (Component {} InputOut)

type CheckboxAttrs' r =
  ( checked :: Behavior Boolean
  | Attributes' + r
  )

type CheckboxAttrs = CheckboxAttrs' ()

type CheckboxOut' r =
  ( checked :: Behavior Boolean
  , checkedChange :: Stream Boolean
  | Output' + r
  )

type CheckboxOutput = Record (CheckboxOut' ())

checkbox :: forall a. Subrow a CheckboxAttrs => Record a -> Component {} CheckboxOutput
checkbox = runFn1 _checkbox

checkbox_ :: Component {} CheckboxOutput
checkbox_ = checkbox {}

foreign import _checkbox :: forall a. Subrow a CheckboxAttrs => Fn1 (Record a) (Component {} CheckboxOutput)

text :: String -> Component {} Unit
text = _text

foreign import _text :: String -> Component {} Unit

textB :: Behavior String -> Component {} Unit
textB = _textB

foreign import _textB :: Behavior String -> Component {} Unit

foreign import br :: Component {} Unit

