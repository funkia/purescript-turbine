module Main where

import Prelude

import Control.Apply (lift2)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console (CONSOLE, log)
import DOM (DOM)
import Data.Array (cons, filter)
import Data.Foldable (fold, foldr)
import Data.Hareactive (Behavior, Stream, Now, sample, scan, scanS, switchStream)
import Data.Monoid ((<>))
import Turbine (Component, runComponent, output, modelView, (\>), list)
import Turbine.HTML as E
import Counters.Version1 as Version1

type CounterOut = {count :: Behavior Int, delete :: Stream Int}

counterModel :: _ -> Int -> (Now CounterOut)
counterModel {increment, decrement, delete} id = do
  let changes = (increment $> 1) <> (decrement $> -1)
  count <- sample $ scan (+) 0 changes
  pure {count, delete: delete $> id}

counterView {count} =
  E.div (
    E.text "Counter" \>
    E.span (E.textB $ map show count) \>
    E.button "+" `output` (\o -> {increment: o.click}) \>
    E.button "-" `output` (\o -> {decrement: o.click}) \>
    E.button "x" `output` (\o -> {delete: o.click})
  )

counter :: Int -> Component {} CounterOut
counter = modelView counterModel counterView

type ListOut = {sum :: Behavior Int, counterIds :: Behavior (Array Int)}

counterListModel
  :: {addCounter :: Stream Unit, listOut :: Behavior (Array CounterOut)}
  -> Array Int
  -> Now ListOut
counterListModel {addCounter, listOut} init = do
  let sum = listOut >>= (map (_.count) >>> foldr (lift2 (+)) (pure 0))

  let removeId = map (fold <<< map (_.delete)) listOut
  let removeCounter = map (\i -> filter (i /= _)) (switchStream removeId)

  nextId <- sample $ scanS (+) 0 (addCounter $> 1)
  let appendCounter = cons <$> nextId

  counterIds <- sample $ scan ($) init (appendCounter <> removeCounter)
  pure {sum, counterIds}

counterListView {sum, counterIds} =
  E.div (
    E.h1 (E.text "Version 1") \>
    Version1.counter 0 \>
    E.br \>
    E.h1 (E.text "Counters") \>
    E.span (E.textB (map (\n -> "Sum " <> show n) sum)) \>
    E.button "Add counter" `output` (\o -> {addCounter: o.click}) \>
    list counter counterIds id `output` (\o -> {listOut: o})
  )

counterList = modelView counterListModel counterListView

main :: forall e. Eff (dom :: DOM | e) Unit
main = runComponent "#mount" (counterList [0])
