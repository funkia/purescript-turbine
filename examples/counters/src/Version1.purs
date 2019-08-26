module Counters.Version1
  ( counter
  ) where

import Prelude

import Hareactive.Combinators (accum)
import Turbine (Component, use, component, output, (</>))
import Turbine.HTML as E

counter :: Int -> Component {} {}
counter id = component \on -> do
  count <- accum (+) 0 on.change
  (
    E.div {} (
      E.text "Counter " </>
      E.span {} (E.textB $ map show count) </>
      E.button {} (E.text "+" ) `use` (\o -> { change: o.click $> 1 }) </>
      E.button {} (E.text "-" ) `use` (\o -> { change: o.click $> -1 })
    )
  ) `output` {}
