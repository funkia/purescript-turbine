module Counters.Main where

import Prelude

import Effect (Effect)
import Counters.Version1 as Version1
import Counters.Version2 as Version2
import Hareactive.Types (Behavior, Stream, Now)
import Hareactive.Combinators (stepper)
import Turbine (Component, runComponent, dynamic, output, modelView, (</>))
import Turbine.HTML as H

data Version = One | Two

versionToComponent :: Version -> Component {} {}
versionToComponent One = Version1.counter 0 $> {}
versionToComponent Two = Version2.counterList [0] $> {}

type AppModelOut = {version :: Behavior (Component {} {})}

appModel :: AppViewOut -> Now AppModelOut
appModel input = do
  version <- stepper One (input.selectVersion1 <> input.selectVersion2)
  pure { version: versionToComponent <$> version }

type AppViewOut =
  { selectVersion1 :: Stream Version
  , selectVersion2 :: Stream Version
  }

appView :: AppModelOut -> Component AppViewOut {}
appView out =
  H.button {} (H.text "Version 1") `output` (\o -> { selectVersion1: o.click $> One }) </>
  H.button {} (H.text "Version 2") `output` (\o -> { selectVersion2: o.click $> Two }) </>
  (dynamic out.version)

app = modelView appModel appView

main :: Effect Unit
main = runComponent "#mount" app
