module Counters.Main where

import Prelude

import Counters.Version1 as Version1
import Counters.Version2 as Version2
import Effect (Effect)
import Hareactive.Combinators (stepper)
import Turbine (Component, component, dynamic, use, output, runComponent, (</>))
import Turbine.HTML as E

data Version = One | Two

versionToComponent :: Version -> Component {} {}
versionToComponent One = Version1.counter 0
versionToComponent Two = Version2.counterList [0]

app :: Component {} {}
app = component \on -> do
  version <- stepper One on.selectVersion
  (
    E.button {} (E.text "Version 1") `use` (\o -> { selectVersion: o.click $> One }) </>
    E.button {} (E.text "Version 2") `use` (\o -> { selectVersion: o.click $> Two }) </>
    (dynamic (versionToComponent <$> version))
  ) `output` {}

main :: Effect Unit
main = runComponent "#mount" app
