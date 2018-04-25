module Turbine
  ( Component
  , runComponent
  , modelView
  , merge
  , (</>)
  , dynamic
  , output
  , list
  ) where

import Control.Applicative (pure)
import Control.Apply (lift2)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Uncurried (EffFn2, runEffFn2)
import DOM (DOM)
import Data.Function.Uncurried (Fn2, runFn2, mkFn2, Fn3, runFn3)
import Data.Hareactive (Behavior, Now)
import Data.Semigroup (append)
import Prelude (class Apply, class Bind, class Functor, class Semigroup, Unit)

foreign import data Component :: Type -> Type -> Type

-- Component instances

instance semigroupComponent :: Semigroup a => Semigroup (Component o a) where
  append = lift2 append

instance functorComponent :: Functor (Component o) where
  map = runFn2 _map

foreign import _map :: forall o a b. Fn2 (a -> b) (Component o a) (Component o b)

instance applyComponent :: Apply (Component o) where
  apply = runFn2 _apply

foreign import _apply :: forall o a b. Fn2 (Component o (a -> b)) (Component o a) (Component o b)

instance bindComponent :: Bind (Component o) where
  bind = runFn2 _bind

foreign import _bind :: forall o a b. Fn2 (Component o a) (a -> Component o b) (Component o b)

modelView :: forall o p a x. (o -> x -> Now p) -> (p -> Component o a) -> (x -> Component {} p)
modelView m v = runFn2 _modelView (mkFn2 m) v

foreign import _modelView :: forall o p a x. Fn2 (Fn2 o x (Now p)) (p -> Component o a) (x -> Component {} p)

runComponent :: forall o a eff. String -> Component o a -> Eff (dom :: DOM | eff) Unit
runComponent = runEffFn2 _runComponent

foreign import _runComponent :: forall o a eff. EffFn2 (dom :: DOM | eff) String (Component o a) Unit

foreign import dynamic :: forall o a. Behavior (Component o a) -> Component {} (Behavior a)

list :: forall a b o.
  (a -> Component o b) -> Behavior (Array a) -> (a -> Int) -> Component {} (Behavior (Array b))
list = runFn3 _list

foreign import _list :: forall a b o.
  Fn3 (a -> Component o b) (Behavior (Array a)) (a -> Int) (Component {} (Behavior (Array b)))

merge :: forall a o b p q. Union o p q => Component { | o } a -> Component { | p } b -> Component { | q } { | q }
merge = runFn2 _merge

foreign import _merge :: forall a o b p q. Union o p q => Fn2 (Component { | o } a) (Component { | p } b) (Component { | q } { | q })
infixl 0 merge as </>

output :: forall a o p q. Union o p q => Component { | o } a -> (a -> { | p }) -> Component { | q } a
output = runFn2 _output

foreign import _output :: forall a o p q. Union o p q => Fn2 (Component { | o } a) (a -> { | p }) (Component { | q } a)

foreign import loop :: forall a o. (a -> Component o a) -> Component o a

