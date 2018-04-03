module Main where

import Prelude

import Control.Monad.Eff (Eff)
import Counters.Version1 as Version1
import Counters.Version2 as Version2
import Data.Hareactive (Behavior, Stream, Now, sample, stepper)
import Turbine (Component, runComponent, dynamic, output, modelView, (\>))
import Turbine.HTML as E

data Version = One | Two

versionToComponent :: Version -> Component {} {}
versionToComponent One = Version1.counter 0 $> {}
versionToComponent Two = Version2.counterList [0] $> {}

type AppModelOut = {version :: Behavior (Component {} {})}

appModel :: AppViewOut -> Unit -> Now AppModelOut
appModel input _ = do
  version <- sample $ stepper One (input.selectVersion1 <> input.selectVersion2)
  pure {version: versionToComponent <$> version}

type AppViewOut =
  { selectVersion1 :: Stream Version
  , selectVersion2 :: Stream Version
  }

appView :: AppModelOut -> Component _ AppViewOut
appView out =
  E.button "Version 1" `output` (\o -> {selectVersion1: o.click $> One}) \>
  E.button "Version 2" `output` (\o -> {selectVersion2: o.click $> Two}) \>
  (dynamic out.version)

app = modelView appModel appView unit

main :: Eff _ Unit
main = runComponent "#mount" app
