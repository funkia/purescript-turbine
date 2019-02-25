module Counters.Version2
  ( counterList
  ) where

import Prelude

import Control.Apply (lift2)
import Data.Array (cons, filter)
import Data.Foldable (fold, foldr)
import Hareactive.Combinators (scan, scanS, switchStream)
import Hareactive.Types (Behavior, Stream, Now)
import Turbine (Component, list, modelView, output, static, (</>))
import Turbine.HTML.Elements as E

type CounterOut =
  { count :: Behavior Int
  , delete :: Stream Int
  }
type CounterViewOut =
  { increment :: Stream Unit
  , decrement :: Stream Unit
  , delete :: Stream Unit
  }

counterModel :: CounterViewOut -> Int -> (Now CounterOut)
counterModel { increment, decrement, delete } id = do
  let changes = (increment $> 1) <> (decrement $> -1)
  count <- scan (+) 0 changes
  pure { count, delete: delete $> id }

counterView :: CounterOut -> Int -> Component CounterViewOut _
counterView { count } _ =
  E.div { class: E.staticClass "foo bar" } (
    E.text "Counter " </>
    E.span {} (E.textB $ map show count) </>
    E.button {} (E.text "+") `output` (\o -> { increment: o.click }) </>
    E.button {} (E.text "-") `output` (\o -> { decrement: o.click }) </>
    E.button {} (E.text "x") `output` (\o -> { delete: o.click })
  )

counter :: Int -> Component {} CounterOut
counter = modelView counterModel counterView

type ListOut =
  { sum :: Behavior Int
  , counterIds :: Behavior (Array Int)
  }
type ListViewOut =
  { addCounter :: Stream Unit
  , listOut :: Behavior (Array CounterOut)
  }

counterListModel :: ListViewOut -> Array Int -> Now ListOut
counterListModel { addCounter, listOut } init = do
  let sum = listOut >>= (map (_.count) >>> foldr (lift2 (+)) (pure 0))
  let removeId = map (fold <<< map (_.delete)) listOut
  let removeCounter = map (\i -> filter (i /= _)) (switchStream removeId)

  nextId <- scanS (+) 0 (addCounter $> 1)
  let appendCounter = cons <$> nextId

  counterIds <- scan ($) init (appendCounter <> removeCounter)
  pure { sum, counterIds }

counterListView :: ListOut -> Array Int -> Component ListViewOut _
counterListView { sum, counterIds } _ =
  E.div {} (
    E.h1 {} (E.text "Counters") </>
    E.span {} (E.textB (map (\n -> "Sum " <> show n) sum)) </>
    E.button {} (E.text "Add counter") `output` (\o -> { addCounter: o.click }) </>
    list (\id -> counter id `output` identity) counterIds identity `output` (\o -> { listOut: o })
  )

counterList :: Array Int -> Component {} ListOut
counterList = modelView counterListModel counterListView
