module Counters.Version1
  ( counter
  ) where

import Prelude

import Control.Apply (lift2)
import Data.Array (cons, filter)
import Data.Foldable (fold, foldr)
import Hareactive.Types (Behavior, Stream, Now)
import Hareactive.Combinators (scan, switchStream)
import Data.Monoid ((<>))
import Turbine (Component, runComponent, output, modelView, (</>), list)
import Turbine.HTML as H

type CounterOut = {count :: Behavior Int}
type CounterViewOut = {increment :: Stream Unit, decrement :: Stream Unit}

counterModel :: CounterViewOut -> Int -> Now CounterOut
counterModel { increment, decrement } id = do
  let changes = (increment $> 1) <> (decrement $> -1)
  count <- scan (+) 0 changes
  pure { count }

counterView :: CounterOut -> Int -> Component CounterViewOut _
counterView {count} _ =
  H.div {} (
    H.text "Counter " </>
    H.span {} (H.textB $ map show count) </>
    H.button {} (H.text "+" ) `output` (\o -> { increment: o.click }) </>
    H.button {} (H.text "-" ) `output` (\o -> { decrement: o.click })
  )

counter :: Int -> Component {} CounterOut
counter = modelView counterModel counterView
