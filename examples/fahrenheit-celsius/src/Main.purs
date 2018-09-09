module Main where

import Prelude

import Data.Number (fromString)
import Effect (Effect)
import Hareactive.Types (Behavior, Stream, Now)
import Hareactive.Combinators (changes, filterJust, sample, stepper)
import Turbine (Component, modelView, output, runComponent, (</>))
import Turbine.HTML.Elements as E
--import Turbine.HTML.Properties as P

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

appView :: AppModelOut -> Unit -> Component AppViewOut _
appView { celsius, fahren } _ = modelView model view {} `output` (\o -> { fahrenChange: changes o.fahrenInput, celsiusChange: changes o.celsiusInput })
  where
    model { fahrenInput, celsiusInput } _ = pure { fahrenInput: fahrenInput, celsiusInput: celsiusInput }
    view _ _ = E.div_ (
      E.div_ (
        E.label_ (E.text "Fahrenheit") </> --[ P.attribute "value" fahren ]
        E.input { value: show <$> fahren } `output` (\o -> { fahrenInput: o.inputValue })
      ) </>
      E.div_ (
        E.label_ (E.text "Celsius") </> --[ P.attribute "value" celsius ]
        E.input { value: show <$> celsius } `output` (\o -> { celsiusInput: o.inputValue })
      )
    ) 

app :: Component {} AppModelOut
app = modelView appModel appView unit

main :: Effect Unit
main = runComponent "#mount" app
