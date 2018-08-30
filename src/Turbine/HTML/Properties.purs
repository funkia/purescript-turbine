module Turbine.HTML.Properties
  ( Property(..)
  , Properties
  , class_
  , attribute
  , class PropertyValue
  , toValue
  ) where

import Hareactive.Types (Behavior)
import Prelude (identity, map, pure, show, (<<<))

{-- import Data.Array (Array) --}

-- | Type class to implement overloads for property values.
class PropertyValue a where
  toValue :: a -> Behavior String

-- | A string can be used as a property value.
instance propertyValueString :: PropertyValue String where
  toValue = pure

-- | A number can be used as a property value.
instance propertyValueNumber :: PropertyValue Number where
  toValue = pure <<< show

-- | A behavior of a string can be used as a property value.
instance propertyValueBehaviorString :: PropertyValue (Behavior String) where
  toValue = identity

-- | A behavior of a number can be used as a property value.
instance propertyValueBehaviorNumber :: PropertyValue (Behavior Number) where
  toValue = map show

data Property
  = Attribute String (Behavior String)
  | Class (Behavior String)

type Properties = Array Property

class_ :: forall a. PropertyValue a => a -> Property
class_ = Class <<< toValue

attribute :: forall a. PropertyValue a => String -> a -> Property
attribute name = Attribute name <<< toValue
