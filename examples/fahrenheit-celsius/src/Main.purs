module FahrenheitCelsius.Main where

import Prelude

import Data.Number (fromString)
import Effect (Effect)
import Hareactive.Types (Behavior, Stream, Now)
import Hareactive.Combinators (changes, filterJust, sample, stepper)
import Turbine (Component, modelView, output, runComponent, (</>))
import Turbine.HTML.Elements as E

type AppModelOut =
  { fahren :: Behavior Number
  , celsius :: Behavior Number
  }

type AppViewOut =
  { fahrenChange :: Stream String
  , celsiusChange :: Stream String }

parseNumbers :: Stream String -> Stream Number
parseNumbers = filterJust <<< (map fromString)

appModel :: _ -> Unit -> Now AppModelOut
appModel { fahrenChange, celsiusChange } _ =
  let
    fahrenToCelsius f = (f - 32.0) / 1.8
    celsiusToFahren c = (c * 9.0) / 5.0 + 32.0
    celsiusNrChange = parseNumbers celsiusChange
    fahrenNrChange = parseNumbers fahrenChange
  in do
    celsius <- sample $ stepper 0.0 (celsiusNrChange <> (fahrenToCelsius <$> fahrenNrChange))
    fahren <- sample $ stepper 0.0 (fahrenNrChange <> (celsiusToFahren <$> celsiusNrChange))
    pure { fahren, celsius }

appView :: AppModelOut -> Unit -> Component _ _
appView { celsius, fahren } _ =
  E.div_ (
    E.div_ (
      E.label_ (E.text "Fahrenheit") </>
      E.input { value: show <$> fahren } `output` (\o -> { fahrenChange: changes o.inputValue })
    ) </>
    E.div_ (
      E.label_ (E.text "Celsius") </>
      E.input { value: show <$> celsius } `output` (\o -> { celsiusChange: changes o.inputValue })
    )
  )

app :: Component {} AppModelOut
app = modelView appModel appView unit

main :: Effect Unit
main = runComponent "#mount" app
