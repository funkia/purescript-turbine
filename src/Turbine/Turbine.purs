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

import Control.Apply (lift2)
import Effect (Effect)
import Effect.Uncurried (EffectFn2, runEffectFn2)
import Data.Function.Uncurried (Fn2, runFn2, mkFn2, Fn3, runFn3)
import Data.Hareactive (Behavior, Now)
import Data.Semigroup (append)
import Prelude (class Apply, class Bind, class Functor, class Semigroup, Unit)
import Prim.Row (class Union)

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

runComponent :: forall o a. String -> Component o a -> Effect Unit
runComponent = runEffectFn2 _runComponent

foreign import _runComponent :: forall o a. EffectFn2 String (Component o a) Unit

-- | Turns a behavior of a component into a component of a behavior.
-- | This function is used to create dynamic HTML where the structure of the HTML should change over time.
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

