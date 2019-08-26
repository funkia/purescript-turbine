module Timer.Main where

import Prelude

import Effect (Effect)
import Hareactive.Combinators as H
import Hareactive.Types (Behavior, Stream)
import Math as Math
import Turbine (Component, modelView, use, runComponent, static, (</>))
import Turbine.HTML as E

resetOn :: forall a b. Behavior (Behavior a) -> Stream b -> Behavior (Behavior a)
resetOn b reset = b >>= \bi -> H.switcherFrom bi (H.snapshot b reset)

initialMaxTime :: Number
initialMaxTime = 10.0

timer :: Component _ {}
timer = modelView model view
  where
    model input = do
      let change = (\max cur -> if cur < max then 0.001 else 0.0) <$> input.maxTime <*> input.elapsed
      elapsed <- H.sample $ resetOn (H.integrateFrom change) input.resetTimer
      pure { maxTime: input.maxTime, elapsed }
    view input =
      E.div {} (
        E.h1 {} (E.text "Timer") </>
        E.span {} (E.text "0") </>
        E.progress { value: input.elapsed, max: input.maxTime } (E.empty) </>
        E.span {} (E.textB (show <$> input.maxTime)) </>
        E.div {} (
          E.text "Elapsed seconds: " </>
          E.textB (show <$> Math.floor <$> input.elapsed)
        ) </>
        E.inputRange (static { value: show initialMaxTime, type: "range", min: 0.0, max: 60.0 })
          `use` (\o -> { maxTime: o.value }) </>
        E.div {} (
          E.button {} (E.text "Reset") `use` (\o -> { resetTimer: o.click })
        )
      ) `use` (\o -> { elapsed: input.elapsed })

main :: Effect Unit
main = runComponent "#mount" timer
