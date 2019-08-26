module ContinousTime.Main where

import Prelude

import Effect (Effect)
import Hareactive.Types (Behavior, Stream)
import Hareactive.Combinators (time, stepper, snapshot)
import Data.Array (head)
import Data.Maybe (fromMaybe)
import Data.String (split, Pattern(..))
import Data.JSDate (fromTime, toTimeString)
import Turbine (Component, runComponent, use, component, output, (</>))
import Turbine.HTML as E

formatTime :: Number -> String
formatTime = fromTime >>> toTimeString >>> split (Pattern " ") >>> head >>> fromMaybe ""

type AppModelOut =
  { time :: Behavior Number
  , message :: Behavior String
  }

type AppViewOut = { snapClick :: Stream Unit }

app :: Component {} {}
app = component \on -> do
  let msgFromClick =
        map (\t -> "You last pressed the button at " <> formatTime t)
            (snapshot time on.snapClick)
  message <- stepper "You've not clicked the button yet" msgFromClick
  ( E.h1 {} (E.text "Continuous") </>
    E.p {} (E.textB $ formatTime <$> time) </>
    E.button {} (E.text "Click to snap time") `use` (\o -> { snapClick: o.click }) </>
    E.p {} (E.textB message)
  ) `output` {}

main :: Effect Unit
main = runComponent "#mount" app
