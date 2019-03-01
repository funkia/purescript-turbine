module Timer.Main where

import Prelude

import Effect (Effect)
import Hareactive.Combinators as H
import Hareactive.Types (Behavior, Stream)
import Math as Math
import Turbine (Component, modelView, output, runComponent, static, withStatic, (</>))
import Turbine.HTML as H

resetOn :: forall a b. Behavior (Behavior a) -> Stream b -> Behavior (Behavior a)
resetOn b reset = b >>= \bi -> H.switcherFrom bi (H.snapshot b reset)

initialMaxTime :: Number
initialMaxTime = 10.0

timer :: Component {} _
timer = modelView model view unit
  where
    model input _ = do
      let change = (\max cur -> if cur < max then 1.0 else 0.0) <$> input.maxTime <*> input.elapsed
      elapsed <- H.sample $ resetOn (H.integrateFrom change) input.resetTimer
      pure { maxTime: input.maxTime, elapsed }
    view input _ =
      H.div {} (
        H.h1 {} (H.text "Timer") </>
        H.span {} (H.text "0") </>
        H.progress { value: input.elapsed, max: input.maxTime } (H.empty) </>
        H.span {} (H.textB (show <$> input.maxTime)) </>
        H.div {} (
          H.text "Elapsed seconds: " </>
          H.textB (show <$> Math.round <$> input.elapsed)
        ) </>
        H.inputRange (static { value: show initialMaxTime, type: "range", min: 0.0, max: 60.0 })
          `output` (\o -> { maxTime: o.value }) </>
        H.div {} (
          H.button {} (H.text "Reset") `output` (\o -> { resetTimer: o.click })
        )
      ) `output` (\o -> { elapsed: input.elapsed })

main :: Effect Unit
main = runComponent "#mount" timer
