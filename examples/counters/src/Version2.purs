module Counters.Version2
  ( counterList
  ) where

import Prelude

import Control.Apply (lift2)
import Data.Array (cons, filter)
import Data.Foldable (fold, foldr)
import Hareactive (Behavior, Stream, Now, sample, scan, scanS, switchStream)
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
  count <- sample $ scan (+) 0 changes
  pure { count, delete: delete $> id }

counterView :: CounterOut -> Component CounterViewOut CounterViewOut
counterView {count} =
  E.div (static { class: "foo bar" }) (
    E.text "Counter " </>
    E.span_ (E.textB $ map show count) </>
    E.button_ (E.text "+") `output` (\o -> { increment: o.click }) </>
    E.button_ (E.text "-") `output` (\o -> { decrement: o.click }) </>
    E.button_ (E.text "x") `output` (\o -> { delete: o.click })
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

  nextId <- sample $ scanS (+) 0 (addCounter $> 1)
  let appendCounter = cons <$> nextId

  counterIds <- sample $ scan ($) init (appendCounter <> removeCounter)
  pure { sum, counterIds }

counterListView :: ListOut -> Component _ ListViewOut
counterListView {sum, counterIds} =
  E.div_ (
    E.h1_ (E.text "Counters") </>
    E.span_ (E.textB (map (\n -> "Sum " <> show n) sum)) </>
    E.button_ (E.text "Add counter") `output` (\o -> { addCounter: o.click }) </>
    list (\id -> counter id `output` identity) counterIds identity `output` (\o -> { listOut: o })
  )

counterList :: Array Int -> Component {} ListOut
counterList = modelView counterListModel counterListView
