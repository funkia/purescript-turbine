module Counters.Main where

import Prelude

import Counters.Version1 as Version1
import Counters.Version2 as Version2
import Effect (Effect)
import Hareactive.Combinators (stepper)
import Turbine (Component, component, dynamic, output, result, runComponent, (</>))
import Turbine.HTML as H

data Version = One | Two

versionToComponent :: Version -> Component {} {}
versionToComponent One = Version1.counter 0
versionToComponent Two = Version2.counterList [0]

app :: Component {} {}
app = component \on -> do
  version <- stepper One on.selectVersion
  (
    H.button {} (H.text "Version 1") `output` (\o -> { selectVersion: o.click $> One }) </>
    H.button {} (H.text "Version 2") `output` (\o -> { selectVersion: o.click $> Two }) </>
    (dynamic (versionToComponent <$> version))
  ) `result` {}

main :: Effect Unit
main = runComponent "#mount" app
