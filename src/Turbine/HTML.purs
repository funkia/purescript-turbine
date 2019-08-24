-- | This module contains Turbines DSL for constructing HTML.
-- |
-- | This module is typically imported qualified as.
-- | ```purescript
-- | import Turbine.HTML as H
-- | ```
module Turbine.HTML
  ( Attributes'
  , Output'
  , h1
  , div
  , br
  , p
  , text
  , textB
  , ul
  , li
  , span
  , InputAttrs'
  , InputAttrs
  , InputOut'
  , InputOut
  , input
  , checkbox
  , inputRange
  , textarea
  , button
  , label
  , section
  , header
  , footer
  , table
  , th
  , tr
  , td
  , progress
  , empty
  , class Subrow
  , class RecordOf
  , class RecordOfGo
  , toArray
  , toArrayGo
  , ClassDescription
  , ClassElement
  , staticClass
  , dynamicClass
  , toggleClass
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
import Web.UIEvent.FocusEvent (FocusEvent)
import Web.UIEvent.InputEvent (InputEvent)
import Web.UIEvent.KeyboardEvent (KeyboardEvent)
import Web.UIEvent.MouseEvent (MouseEvent)

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

-- | Creates a static class from a string of space separated class names.
-- |
-- | ```purescript
-- | staticClass "foo bar baz"
-- | ```
foreign import staticClass :: String -> ClassDescription

-- | Creates a dynamic class from a string valued behavior. At any point in time
-- | the element will have the class named in the behavior at that point in
-- | time.
-- |
-- | ```purescript
-- | dynamicClass stringValuedBehavior
-- | ```
foreign import dynamicClass :: Behavior String -> ClassDescription

-- | Takes a class name and a boolean valued behavior. When the behavior is
-- | `true` the element has the class and when the behavior is `false` the
-- | element does not have the class.
-- |
-- | ```purescript
-- | toggleClass "active" isActiveBehavior
-- | <> toggleClass "selected" isSelectedBehavior
-- | ```
toggleClass :: String -> Behavior Boolean -> ClassDescription
toggleClass = runFn2 _toggleClass

foreign import _toggleClass :: Fn2 String (Behavior Boolean) ClassDescription

-- | Class descriptions form a semigroup. This makes it convenient to combine
-- | several types of description and add them to the same element.
-- |
-- | ```purescript
-- | E.div { classes: staticClass "foo"
-- |                  <> dynamicClass beh
-- |                  <> toggleClass "selected" isSelected
-- |       }
-- | ```
derive newtype instance semigroupClassDescription :: Semigroup ClassDescription

-- Elements

-- | This type describes the attributes that all HTML elements accepts.
type Attributes' r =
  ( class :: Behavior String
  , classes :: ClassDescription
  , id :: Behavior String
  | r
  )

type Attributes = Attributes' ()

-- | This type describes the output that all HTML elements output.
type Output' r =
  ( click :: Stream MouseEvent
  , dblclick :: Stream MouseEvent
  , keydown :: Stream KeyboardEvent
  , keyup :: Stream KeyboardEvent
  , blur :: Stream FocusEvent
  | r
  )

type Output = Record (Output' ())

-- This type is not really accurate. But, it is much simpler than an accurate
-- type and this "simplification" does not leak out into the API.
foreign import processAttributes :: forall r. Record r -> Record r

div :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
div = runFn2 _div <<< processAttributes

foreign import _div :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

ul :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
ul = runFn2 _ul <<< processAttributes

foreign import _ul :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

li :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
li = runFn2 _li <<< processAttributes

foreign import _li :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

span :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
span = runFn2 _span <<< processAttributes

foreign import _span :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

p :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
p = runFn2 _p <<< processAttributes

foreign import _p :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

h1 :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
h1 = runFn2 _h1 <<< processAttributes

foreign import _h1 :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

h2 :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
h2 = runFn2 _h2 <<< processAttributes

foreign import _h2 :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

h3 :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
h3 = runFn2 _h3 <<< processAttributes

foreign import _h3 :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

h4 :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
h4 = runFn2 _h4 <<< processAttributes

foreign import _h4 :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

h5 :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
h5 = runFn2 _h5 <<< processAttributes

foreign import _h5 :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

h6 :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
h6 = runFn2 _h6 <<< processAttributes

foreign import _h6 :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

label :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
label = runFn2 _label <<< processAttributes

foreign import _label :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

section :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
section = runFn2 _section <<< processAttributes

foreign import _section :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

header :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
header = runFn2 _header <<< processAttributes

foreign import _header :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

footer :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
footer = runFn2 _footer <<< processAttributes

foreign import _footer :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

type ButtonOut = { click :: Stream Unit }

button :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o ButtonOut
button = runFn2 _button <<< processAttributes

foreign import _button :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o ButtonOut)

a :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
a = runFn2 _a <<< processAttributes

foreign import _a :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

type InputAttrs' r =
  ( placeholder :: Behavior String
  , type :: Behavior String
  , value :: Behavior String
  , autofocus :: Behavior Boolean
  | Attributes' + r
  )

type InputAttrs = InputAttrs' ()

type InputOut' r =
  ( value :: Behavior String
  , input :: Stream InputEvent
  , keyup :: Stream KeyboardEvent
  | Output' + r
  )

type InputOut = Record (InputOut' ())

input :: forall r. Subrow r InputAttrs => Record r -> Component InputOut {}
input = runFn1 _input <<< processAttributes

foreign import _input :: forall r. Subrow r InputAttrs => Fn1 (Record r) (Component InputOut {})

type InputRangeAttrs' r =
  ( min :: Behavior Number
  , max :: Behavior Number
  | InputAttrs' + r
  )

type InputRangeOut' r =
  ( value :: Behavior Number
  | InputOut' + r
  )

type InputRangeOut = Record (InputRangeOut' ())

-- | An input element with the `type` attribute set to `range`. Compared to a
-- | normal a normal input element this variant accepts three additional
-- | attributes all of which are numbers: `max`, `min`, and `step`. Additionally
-- | the `value` output is a `Number` and not a `String`.
inputRange :: forall r. Subrow r (InputRangeAttrs' ()) => Record r -> Component {} { | (InputRangeOut' ()) }
inputRange = runFn1 _inputRange <<< processAttributes

foreign import _inputRange :: forall r. Subrow r (InputRangeAttrs' ()) => Fn1 (Record r) (Component {} ({ | InputRangeOut' ()}))

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

-- | An input element with the `type` attribute set to `checkbox`.
-- |
-- | Most notably a `checkbox` outputs a behavior named `checked` denoting
-- | whether or not the checkbox is currently checked.
checkbox :: forall r. Subrow r CheckboxAttrs => Record r -> Component {} CheckboxOutput
checkbox = runFn1 _checkbox <<< processAttributes

foreign import _checkbox :: forall r. Subrow r CheckboxAttrs => Fn1 (Record r) (Component {} CheckboxOutput)

type TextareaAttrs' r =
  ( rows :: Behavior Int
  , cols :: Behavior Int
  | InputAttrs' + r
  )

type TextareaAttrs = TextareaAttrs' ()

-- | A textarea element. Accepts `rows` and `cols` attributes.
textarea :: forall r. Subrow r TextareaAttrs => Record r -> Component {} InputOut
textarea = runFn1 _textarea <<< processAttributes

foreign import _textarea :: forall r. Subrow r TextareaAttrs => Fn1 (Record r) (Component {} InputOut)

type ProgressAttrs' r =
  ( value :: Behavior Number
  , max :: Behavior Number
  | Attributes' + r
  )

type ProgressAttrs = ProgressAttrs' ()

-- | A progress element. At accepts `value` and `max` both of which must be
-- | `Number` valued.
progress :: forall r a o. Subrow r ProgressAttrs => Record r -> Component a o -> Component o Output
progress = runFn2 _progress <<< processAttributes

foreign import _progress :: forall r a o. Subrow r ProgressAttrs => Fn2 (Record r) (Component a o) (Component o Output)

-- | Creates a static text node based on the given string.
-- |
-- | For a dynamic version see [`textB`](#v:textB).
text :: String -> Component Unit {}
text = _text

foreign import _text :: String -> Component Unit {}

-- | Creates a dynamic text node based on the given string valued behavior. The
-- | value of the text node is always equal to the value of the behavior.
textB :: Behavior String -> Component Unit {}
textB = _textB

foreign import _textB :: Behavior String -> Component Unit {}

table :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
table = runFn2 _table <<< processAttributes

foreign import _table :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

th :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
th = runFn2 _th <<< processAttributes

foreign import _th :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

tr :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
tr = runFn2 _tr <<< processAttributes

foreign import _tr :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

td :: forall r a o. Subrow r Attributes => Record r -> Component a o -> Component o Output
td = runFn2 _td <<< processAttributes

foreign import _td :: forall r a o. Subrow r Attributes => Fn2 (Record r) (Component a o) (Component o Output)

-- | A `br` element. Note that this is a constant and not a function since a
-- | `br` elements takes neither attributes nor children.
foreign import br :: Component Unit {}

-- | An empty component corresponding to no HTML nor effects.
foreign import empty :: Component Unit {}
