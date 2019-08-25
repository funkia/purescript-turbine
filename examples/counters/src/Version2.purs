module Counters.Version2
  ( counterList
  ) where

import Prelude

import Control.Apply (lift2)
import Data.Array (cons, filter)
import Data.Foldable (fold, foldr)
import Hareactive.Combinators (accum, scan, shiftCurrent)
import Hareactive.Types (Behavior, Stream)
import Turbine (Component, list, output, component, result, (</>))
import Turbine.HTML as H

type CounterOut =
  { count :: Behavior Int
  , delete :: Stream Int
  }

counter :: Int -> Component CounterOut {}
counter id = component \on -> do
  count <- accum (+) 0 on.change
  (
    H.div {} (
      H.text "Counter " </>
      H.span {} (H.textB $ map show count) </>
      H.button {} (H.text "+" ) `output` (\o -> { change: o.click $> 1 }) </>
      H.button {} (H.text "-" ) `output` (\o -> { change: o.click $> -1 }) </>
      H.button {} (H.text "x") `output` (\o -> { delete: o.click })
    )
  ) `result` { count, delete: on.delete $> id }

counterList :: Array Int -> Component {} {}
counterList init = component \on -> do
  let sum = on.listOut >>= (map (_.count) >>> foldr (lift2 (+)) (pure 0))
  let removeId = map (fold <<< map (_.delete)) on.listOut
  let removeCounter = map (\i -> filter (i /= _)) (shiftCurrent removeId)
  nextId <- scan (+) 0 (on.addCounter $> 1)
  let appendCounter = cons <$> nextId
  counterIds <- accum ($) init (appendCounter <> removeCounter)
  (
    H.div {} (
      H.h1 {} (H.text "Counters") </>
      H.span {} (H.textB (map (\n -> "Sum " <> show n) sum)) </>
      H.button {} (H.text "Add counter") `output` (\o -> { addCounter: o.click }) </>
      list (\id -> counter id `output` identity) counterIds identity `output` (\o -> { listOut: o })
    )
  ) `result` {}
