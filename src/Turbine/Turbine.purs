module Turbine
  ( Component
  , runComponent
  , class IsComponent
  , toComponent
  , text
  ) where

import Prelude (Unit, id)
import Control.Monad.Eff (Eff)
import Data.Function.Uncurried (Fn2, runFn2)
import DOM (DOM)

foreign import data Component :: Type -> Type

foreign import _runComponent :: forall a eff. Fn2 String (Component a) (Eff (dom :: DOM | eff) Unit)

runComponent :: forall a eff. String -> Component a -> Eff (dom :: DOM | eff) Unit
runComponent = runFn2 _runComponent

-- | Type class representing types that can be converted into compoent.
class IsComponent a b | a -> b where
  toComponent :: a -> Component b

instance toComponentComponent :: IsComponent (Component a) a where
  toComponent = id

instance toComponentString :: IsComponent String Unit where
  toComponent = text

foreign import text :: String -> Component Unit
