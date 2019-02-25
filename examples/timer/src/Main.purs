module Timer.Main where

import Prelude

import Effect (Effect)
import Hareactive.Combinators as H
import Hareactive.Types (Behavior, Stream)
import Math as Math
import Turbine (Component, modelView, output, runComponent, static, withStatic, (</>))
import Turbine.HTML.Elements as E

resetOn :: forall a b. Behavior (Behavior a) -> Stream b -> Behavior (Behavior a)
resetOn b reset = b >>= \bi -> H.switcherB bi (H.snapshot b reset)

initialMaxTime :: Number
initialMaxTime = 10.0

timer :: Component {} _
timer = modelView model view unit
  where
    model input _ = do
      let change = (\max cur -> if cur < max then 1.0 else 0.0) <$> input.maxTime <*> input.elapsed
      elapsed <- H.sample $ resetOn (H.integrateB change) input.resetTimer
      pure { maxTime: input.maxTime, elapsed }
    view input _ =
      E.div {} (
        E.h1 {} (E.text "Timer") </>
        E.span {} (E.text "0") </>
        E.progress { value: input.elapsed, max: input.maxTime } (E.empty) </>
        E.span {} (E.textB (show <$> input.maxTime)) </>
        E.div {} (
          E.text "Elapsed seconds: " </>
          E.textB (show <$> Math.round <$> input.elapsed)
        ) </>
        E.inputRange (static { value: show initialMaxTime, type: "range", min: 0.0, max: 60.0 })
          `output` (\o -> { maxTime: o.value }) </>
        E.div {} (
          E.button {} (E.text "Reset") `output` (\o -> { resetTimer: o.click })
        )
      ) `output` (\o -> { elapsed: input.elapsed })

main :: Effect Unit
main = runComponent "#mount" timer
