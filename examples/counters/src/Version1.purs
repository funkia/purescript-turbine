module Counters.Version1
  ( counter
  ) where

import Prelude

import Data.Array (cons, filter)
import Data.Foldable (fold, foldr)
import Hareactive.Types (Behavior, Stream, Now)
import Hareactive.Combinators (accum)
import Data.Monoid ((<>))
import Turbine (Component, runComponent, output, modelView, (</>), list)
import Turbine.HTML as H

type CounterOut = {count :: Behavior Int}
type CounterViewOut = {increment :: Stream Unit, decrement :: Stream Unit}

counter :: Int -> Component {} CounterOut
counter id = modelView model view
  where
    model { increment, decrement } = do
      let changes = (increment $> 1) <> (decrement $> -1)
      count <- accum (+) 0 changes
      pure { count }
    view { count } =
      H.div {} (
        H.text "Counter " </>
        H.span {} (H.textB $ map show count) </>
        H.button {} (H.text "+" ) `output` (\o -> { increment: o.click }) </>
        H.button {} (H.text "-" ) `output` (\o -> { decrement: o.click })
      )
