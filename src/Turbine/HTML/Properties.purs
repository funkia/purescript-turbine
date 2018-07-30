module Turbine.HTML.Properties
  ( Property(..)
  , Properties
  , class_
  , attribute
  , class PropertyValue
  , toValue
  ) where

import Prelude (class Show, show, map, pure, (<<<))
import Hareactive (Behavior)

{-- import Data.Array (Array) --}

-- | Type class to implement overloads for property values.
class PropertyValue a where
  toValue :: a -> Behavior String

-- | A string can be used as a property value.
instance propertyValueString :: PropertyValue String where
  toValue = pure

-- | A behavior of something that can be show can be used as a property value.
instance propertyValueBehavior :: Show a => PropertyValue (Behavior a) where
  toValue = map show

data Property
  = Attribute String (Behavior String)
  | Class (Behavior String)

type Properties = Array Property

class_ :: forall a. PropertyValue a => a -> Property
class_ = Class <<< toValue

attribute :: forall a. PropertyValue a => String -> a -> Property
attribute name = Attribute name <<< toValue
