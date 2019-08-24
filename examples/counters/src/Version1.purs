module Counters.Version1
  ( counter
  ) where

import Prelude

import Data.Array (cons, filter)
import Data.Foldable (fold, foldr)
import Hareactive.Types (Behavior, Stream, Now)
import Hareactive.Combinators (accum)
import Data.Monoid ((<>))
import Turbine (Component, runComponent, output, component, result, (</>), list)
import Turbine.HTML as H

type CounterOut = { count :: Behavior Int }

counter :: Int -> Component CounterOut {}
counter id = component \on -> do
  count <- accum (+) 0 on.change
  (
    H.div {} (
      H.text "Counter " </>
      H.span {} (H.textB $ map show count) </>
      H.button {} (H.text "+" ) `output` (\o -> { change: o.click $> 1 }) </>
      H.button {} (H.text "-" ) `output` (\o -> { change: o.click $> -1 })
    )
  ) `result` { count }
