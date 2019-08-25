module FahrenheitCelsius.Main where

import Prelude

import Data.Number (fromString)
import Effect (Effect)
import Hareactive.Types (Behavior, Stream)
import Hareactive.Combinators (changes, filterJust, stepper)
import Turbine (Component, component, output, result, runComponent, (</>))
import Turbine.HTML as H

type TemperatureConverterOutput =
  { fahren :: Behavior Number
  , celsius :: Behavior Number
  }

parseNumbers :: Stream String -> Stream Number
parseNumbers = filterJust <<< (map fromString)

temperatureConverter :: Component TemperatureConverterOutput {}
temperatureConverter = component \on -> do
  let fahrenToCelsius f = (f - 32.0) / 1.8
      celsiusToFahren c = (c * 9.0) / 5.0 + 32.0
      celsiusNrChange = parseNumbers on.celsiusChange
      fahrenNrChange = parseNumbers on.fahrenChange
  celsius <- stepper 0.0 (celsiusNrChange <> (fahrenToCelsius <$> fahrenNrChange))
  fahren <- stepper 0.0 (fahrenNrChange <> (celsiusToFahren <$> celsiusNrChange))
  ( H.div {} (
      H.div {} (
        H.label {} (H.text "Fahrenheit") </>
        H.input { value: show <$> fahren } `output` (\o -> { fahrenChange: changes o.value })
      ) </>
      H.div {} (
        H.label {} (H.text "Celsius") </>
        H.input { value: show <$> celsius } `output` (\o -> { celsiusChange: changes o.value })
      )
    )
  ) `result` { fahren, celsius }

main :: Effect Unit
main = runComponent "#mount" temperatureConverter
