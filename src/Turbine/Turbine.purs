module Turbine
  ( Component
  , runComponent
  , class IsComponent
  , toComponent
  , text
  ) where

import Control.Applicative (class Applicative, liftA1, pure)
import Control.Apply (class Apply, lift2)
import Prelude (Unit, id, class Semigroup, class Functor, (<<<), class Apply, class Applicative, class Bind, class Monad)
import Control.Monad.Eff (Eff)
import Data.Monoid (class Monoid, mempty)
import Data.Semigroup (class Semigroup, append)
import Data.Function.Uncurried (Fn2, runFn2)
import DOM (DOM)

foreign import data Component :: Type -> Type

foreign import _map :: forall a b. Fn2 (a -> b) (Component a) (Component b)

instance functorComponent :: Functor Component where
  map = runFn2 _map

instance applyComponent :: Apply Component where
  apply = runFn2 _apply

foreign import _apply :: forall a b. Fn2 (Component (a -> b)) (Component a) (Component b)

instance applicativeComponent :: Applicative Component where
  pure = _pure

foreign import _pure :: forall a. a -> Component a

instance bindComponent :: Bind Component where
  bind = runFn2 _bind

foreign import _bind :: forall a b. Fn2 (Component a) (a -> Component b) (Component b)

instance monadComponent :: Monad Component

instance semigroupComponent :: Semigroup a => Semigroup (Component a) where
  append = lift2 append

instance monoidComponent :: Monoid a => Monoid (Component a) where
  mempty = pure mempty

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
