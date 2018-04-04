module Turbine.HTML.Properties
  ( Property(..)
  , Properties
  , class_
  , attribute
  ) where

{-- import Data.Array (Array) --}

data Property
  = Attribute String String
  | Class String

type Properties = Array Property

class_ :: String -> Property
class_ = Class

attribute :: String -> String -> Property
attribute = Attribute
