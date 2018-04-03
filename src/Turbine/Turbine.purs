module Turbine
  ( Component
  , runComponent
  , class IsBehavior
  , toBehavior
  , modelView
  , merge
  , (\>)
  , dynamic
  , output
  , list
  ) where

import Control.Applicative (class Applicative, liftA1, pure)
import Control.Apply (class Apply, lift2)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Uncurried (EffFn2, runEffFn2)
import DOM (DOM)
import Data.Function.Uncurried (Fn2, runFn2, mkFn2, Fn3, runFn3)
import Data.Hareactive (Behavior, Now)
import Data.Monoid (class Monoid, mempty)
import Data.Record.Builder as B
import Data.Semigroup (class Semigroup, append)
import Prelude (class Applicative, class Apply, class Bind, class Functor, class Monad, class Semigroup, class Show, Unit, bind, id, map, show, unit, (<<<))

foreign import data Component :: Type -> Type -> Type

-- Component instances

foreign import _map :: forall o a b. Fn2 (a -> b) (Component o a) (Component o b)

instance functorComponent :: Functor (Component o) where
  map = runFn2 _map

instance applyComponent :: Apply (Component o) where
  apply = runFn2 _apply

foreign import _apply :: forall o a b. Fn2 (Component o (a -> b)) (Component o a) (Component o b)

instance semigroupComponent :: Semigroup a => Semigroup (Component o a) where
  append = lift2 append

{-- instance monoidComponent :: Monoid a => Monoid (Component a) where --}
{--   mempty = pure mempty --}


modelView :: forall o a b c. (a -> b -> Now c) -> (c -> Component o a) -> (b -> Component {} c)
modelView m v = runFn2 _modelView (mkFn2 m) v

foreign import _modelView :: forall o a b c. Fn2 (Fn2 a b (Now c)) (c -> Component o a) (b -> Component {} c)

runComponent :: forall o a eff. String -> Component o a -> Eff (dom :: DOM | eff) Unit
runComponent = runEffFn2 _runComponent

foreign import _runComponent :: forall o a eff. EffFn2 (dom :: DOM | eff) String (Component o a) Unit

foreign import dynamic :: forall o a. Behavior (Component o a) -> Component {} (Behavior a)

list :: forall a b o.
  (a -> Component o b) -> Behavior (Array a) -> (a -> Int) -> Component {} (Behavior (Array b))
list = runFn3 _list

foreign import _list :: forall a b o.
  Fn3 (a -> Component o b) (Behavior (Array a)) (a -> Int) (Component {} (Behavior (Array b)))

-- | Type class representing types that can be converted into a behavior.
-- | Any type can be converted into a behavior with `pure a`. But only a few
-- | key types implement this type class in the cases where auto-lifting is
-- | particularly convenient.
class IsBehavior a b | a -> b where
  toBehavior :: a -> Behavior b

-- | Naturally a behavior can be converted to a behavior.
instance isBehaviorBehavior :: IsBehavior (Behavior a) a where
  toBehavior = id

-- | A string can be converted to a constant behavior of that string.
instance isBehaviorString :: IsBehavior String String where
  toBehavior = pure

merge :: forall a o b p q. Union o p q => Component { | o } a -> Component { | p } b -> Component { | q } { | q }
merge = runFn2 _merge

foreign import _merge :: forall a o b p q. Union o p q => Fn2 (Component { | o } a) (Component { | p } b) (Component { | q } { | q })

infixl 0 merge as \>

output :: forall a o p q. Union o p q => Component { | o } a -> (a -> { | p }) -> Component { | q } a
output = runFn2 _output

foreign import _output :: forall a o p q. Union o p q => Fn2 (Component { | o } a) (a -> { | p }) (Component { | q } a)

foreign import loop :: forall a o. (a -> Component o a) -> Component o a

