module FahrenheitCelsius.Main where

import Prelude

import Data.Number (fromString)
import Effect (Effect)
import Hareactive.Types (Behavior, Stream)
import Hareactive.Combinators (changes, filterJust, stepper)
import Turbine (Component, component, use, output, runComponent, (</>))
import Turbine.HTML as E

fahrenToCelsius :: Number -> Number
fahrenToCelsius f = (f - 32.0) / 1.8

celsiusToFahren :: Number -> Number
celsiusToFahren c = (c * 9.0) / 5.0 + 32.0

type TemperatureConverterOutput =
  { fahren :: Behavior String
  , celsius :: Behavior String
  }

parseNumbers :: Stream String -> Stream Number
parseNumbers = filterJust <<< (map fromString)

temperatureConverter :: Component TemperatureConverterOutput {}
temperatureConverter = component \on -> do
  let celsiusNrChange = parseNumbers on.celsiusChange
      fahrenNrChange = parseNumbers on.fahrenChange
  celsius <- stepper "0" (on.celsiusChange <> (show <$> fahrenToCelsius <$> fahrenNrChange))
  fahren <- stepper "0" (on.fahrenChange <> (show <$> celsiusToFahren <$> celsiusNrChange))
  ( E.div {} (
      E.div {} (
        E.label {} (E.text "Fahrenheit") </>
        E.input { value: fahren } `use` (\o -> { fahrenChange: changes o.value })
      ) </>
      E.div {} (
        E.label {} (E.text "Celsius") </>
        E.input { value: celsius } `use` (\o -> { celsiusChange: changes o.value })
      )
    )
  ) `output` { fahren, celsius }

main :: Effect Unit
main = runComponent "#mount" temperatureConverter
