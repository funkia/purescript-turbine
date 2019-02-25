module Main where

import Prelude

import Effect (Effect)
import Data.Either (fromRight)
import Hareactive.Types (Behavior)
import Data.String.Regex (Regex, regex, test)
import Data.String.Regex.Flags (ignoreCase)
import Partial.Unsafe (unsafePartial)
import Turbine (Component, runComponent, output, modelView, (</>))
import Turbine.HTML.Elements as E

emailRegex :: Regex
emailRegex = unsafePartial $ fromRight $ regex ".+@.+\\..+" ignoreCase

isValidEmail :: String -> Boolean
isValidEmail = test emailRegex

validToString :: Boolean -> String
validToString = if _ then "valid" else "invalid"

app :: Component {} { isValid :: Behavior Boolean }
app = modelView model view unit
  where
    model { email } _ =
      pure { isValid: isValidEmail <$> email }
    view { isValid } _ =
      E.h1 {} (E.text "Email validator") </>
      E.input {} `output` (\o -> { email: o.value }) </>
        E.p {} (
        E.text "Email is " </>
        E.textB (validToString <$> isValid)
      )

main :: Effect Unit
main = runComponent "#mount" app
