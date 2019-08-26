module FahrenheitCelsius.Main where

import Prelude

import Data.Number (fromString)
import Effect (Effect)
import Hareactive.Types (Behavior, Stream)
import Hareactive.Combinators (changes, filterJust, stepper)
import Turbine (Component, component, use, output, runComponent, (</>))
import Turbine.HTML as E

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
  ( E.div {} (
      E.div {} (
        E.label {} (E.text "Fahrenheit") </>
        E.input { value: show <$> fahren } `use` (\o -> { fahrenChange: changes o.value })
      ) </>
      E.div {} (
        E.label {} (E.text "Celsius") </>
        E.input { value: show <$> celsius } `use` (\o -> { celsiusChange: changes o.value })
      )
    )
  ) `output` { fahren, celsius }

main :: Effect Unit
main = runComponent "#mount" temperatureConverter
