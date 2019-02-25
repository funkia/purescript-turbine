module ContinousTime.Main where

import Prelude

import Effect (Effect)
import Hareactive.Types (Behavior, Stream, Now)
import Hareactive.Combinators (time, sample, stepper, snapshot)
import Data.Array (head)
import Data.Maybe (fromMaybe)
import Data.String (split, Pattern(..))
import Data.JSDate (fromTime, toTimeString)
import Turbine (Component, runComponent, output, modelView, (</>))
import Turbine.HTML as H

formatTime :: Number -> String
formatTime = fromTime >>> toTimeString >>> split (Pattern " ") >>> head >>> fromMaybe ""

type AppModelOut =
  { time :: Behavior Number
  , message :: Behavior String
  }

type AppViewOut = { snapClick :: Stream Unit }

appModel :: AppViewOut -> Unit -> Now AppModelOut
appModel { snapClick } _ = do
  let msgFromClick =
        map (\t -> "You last pressed the button at " <> formatTime t)
            (snapshot time snapClick)
  message <- stepper "You've not clicked the button yet" msgFromClick
  pure {time, message}

appView :: AppModelOut -> Unit -> Component AppViewOut _
appView { message, time } _ =
  H.h1 {} (H.text "Continuous") </>
  H.p {} (H.textB $ formatTime <$> time) </>
  H.button {} (H.text "Click to snap time") `output` (\o -> { snapClick: o.click }) </>
  H.p {} (H.textB message)

app = modelView appModel appView unit

main :: Effect Unit
main = runComponent "#mount" app
