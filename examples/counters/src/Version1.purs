module Counters.Version1
  ( counter
  ) where

import Prelude

import Control.Apply (lift2)
import Data.Array (cons, filter)
import Data.Foldable (fold, foldr)
import Hareactive (Behavior, Stream, Now, sample, scan, scanS, switchStream)
import Data.Monoid ((<>))
import Turbine (Component, runComponent, output, modelView, (</>), list)
import Turbine.HTML.Elements as E

type CounterOut = {count :: Behavior Int}
type CounterViewOut = {increment :: Stream Unit, decrement :: Stream Unit}

counterModel :: CounterViewOut -> Int -> Now CounterOut
counterModel { increment, decrement } id = do
  let changes = (increment $> 1) <> (decrement $> -1)
  count <- sample $ scan (+) 0 changes
  pure { count }

counterView :: CounterOut -> Component _ CounterViewOut
counterView {count} =
  E.div_ (
    E.text "Counter " </>
    E.span_ (E.textB $ map show count) </>
    E.button_ (E.text "+" ) `output` (\o -> { increment: o.click }) </>
    E.button_ (E.text "-" ) `output` (\o -> { decrement: o.click })
  )

counter :: Int -> Component {} CounterOut
counter = modelView counterModel counterView

main :: forall e. Eff _ Unit
main = runComponent "#mount" (counter 0)
