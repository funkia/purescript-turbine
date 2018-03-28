module Turbine
  ( Component
  , runComponent
  , class IsComponent
  , toComponent
  , class IsBehavior
  , text
  , toBehavior
  , modelView
  , combine
  , (<+>)
  , dynamic
  ) where

import Control.Applicative (class Applicative, liftA1, pure)
import Control.Apply (class Apply, lift2)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Uncurried (EffFn2, runEffFn2)
import DOM (DOM)
import Data.Function.Uncurried (Fn2, runFn2, mkFn2)
import Data.Hareactive (Behavior, Now)
import Data.Monoid (class Monoid, mempty)
import Data.Record.Builder as B
import Data.Semigroup (class Semigroup, append)
import Prelude (class Applicative, class Apply, class Bind, class Functor, class Monad, class Semigroup, Unit, id, unit, (<<<), bind)

foreign import data Component :: Type -> Type

-- Component instances

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


modelView :: forall a b c. (a -> b -> Now c) -> (c -> Component a) -> (b -> Component c)
modelView m v = runFn2 _modelView (mkFn2 m) v

foreign import _modelView :: forall a b c. Fn2 (Fn2 a b (Now c)) (c -> Component a) (b -> Component c)

foreign import _runComponent :: forall a eff. EffFn2 (dom :: DOM | eff) String (Component a) Unit

runComponent :: forall a eff. String -> Component a -> Eff (dom :: DOM | eff) Unit
runComponent = runEffFn2 _runComponent

foreign import dynamic :: forall a. Behavior (Component a) -> Component (Behavior a)

-- | Type class representing types that can be converted into a component.
class IsComponent a b | a -> b where
  toComponent :: a -> Component b

instance toComponentComponent :: IsComponent (Component a) a where
  toComponent = id

instance toComponentString :: IsComponent String Unit where
  toComponent = _text

{-- instance toComponentBehavior :: forall a b. IsComponent a b => IsComponent Behavior (IsComponent a b) --} 

text :: forall a. IsBehavior a String => a -> Component Unit
text = _textB <<< toBehavior

foreign import _textB :: Behavior String -> Component Unit

foreign import _text :: String -> Component Unit

-- | Type class representing types that can be converted into a behavior.
-- | Any type can be converted into a behavior with `pure a`. But only a few
-- |  key types implement this type class in the cases where auto-lifting is
-- |  particularly convenient.
class IsBehavior a b | a -> b where
  toBehavior :: a -> Behavior b

-- | Naturally a behavior can be converted to a behavior.
instance isBehaviorBehavior :: IsBehavior (Behavior a) a where
  toBehavior = id

-- | A string can be converted to a constant behavior of that string.
instance isBehaviorString :: IsBehavior String String where
  toBehavior = pure

combine :: forall a b c. Union a b c => Component { | a } -> Component { | b } -> Component { | c }
combine a b = do
  aOut <- a
  bOut <- b
  pure (B.build (B.merge bOut) aOut)

infixl 0 combine as <+>

-- \r1 r2 -> Data.Record.Builder.build (Data.Record.Builder.merge r1) r2
