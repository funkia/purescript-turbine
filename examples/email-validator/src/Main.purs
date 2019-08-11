module Main where

import Prelude

import Effect (Effect)
import Data.Either (fromRight)
import Hareactive.Types (Behavior)
import Data.String.Regex (Regex, regex, test)
import Data.String.Regex.Flags (ignoreCase)
import Partial.Unsafe (unsafePartial)
import Turbine (Component, runComponent, output, modelView, (</>))
import Turbine.HTML as H

emailRegex :: Regex
emailRegex = unsafePartial $ fromRight $ regex ".+@.+\\..+" ignoreCase

isValidEmail :: String -> Boolean
isValidEmail = test emailRegex

validToString :: Boolean -> String
validToString = if _ then "valid" else "invalid"

app :: Component {} { isValid :: Behavior Boolean }
app = modelView model view
  where
    model { email } =
      pure { isValid: isValidEmail <$> email }
    view { isValid } =
      H.h1 {} (H.text "Email validator") </>
      H.input {} `output` (\o -> { email: o.value }) </>
        H.p {} (
        H.text "Email is " </>
        H.textB (validToString <$> isValid)
      )

main :: Effect Unit
main = runComponent "#mount" app
