module Counters.Version2
  ( counterList
  ) where

import Prelude

import Control.Apply (lift2)
import Data.Array (cons, filter)
import Data.Foldable (fold, foldr)
import Hareactive.Combinators (accum, scan, shiftCurrent)
import Hareactive.Types (Behavior, Stream)
import Turbine (Component, list, use, component, output, (</>))
import Turbine.HTML as E

type CounterOut =
  { count :: Behavior Int
  , delete :: Stream Int
  }

counter :: Int -> Component CounterOut {}
counter id = component \on -> do
  count <- accum (+) 0 on.change
  (
    E.div {} (
      E.text "Counter " </>
      E.span {} (E.textB $ map show count) </>
      E.button {} (E.text "+" ) `use` (\o -> { change: o.click $> 1 }) </>
      E.button {} (E.text "-" ) `use` (\o -> { change: o.click $> -1 }) </>
      E.button {} (E.text "x") `use` (\o -> { delete: o.click })
    )
  ) `output` { count, delete: on.delete $> id }

counterList :: Array Int -> Component {} {}
counterList init = component \on -> do
  let sum = on.listOut >>= (map (_.count) >>> foldr (lift2 (+)) (pure 0))
  let removeId = map (fold <<< map (_.delete)) on.listOut
  let removeCounter = map (\i -> filter (i /= _)) (shiftCurrent removeId)
  nextId <- scan (+) 0 (on.addCounter $> 1)
  let appendCounter = cons <$> nextId
  counterIds <- accum ($) init (appendCounter <> removeCounter)
  (
    E.div {} (
      E.h1 {} (E.text "Counters") </>
      E.span {} (E.textB (map (\n -> "Sum " <> show n) sum)) </>
      E.button {} (E.text "Add counter") `use` (\o -> { addCounter: o.click }) </>
      list (\id -> counter id `use` identity) counterIds identity `use` (\o -> { listOut: o })
    )
  ) `output` {}
