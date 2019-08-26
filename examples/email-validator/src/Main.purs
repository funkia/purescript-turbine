module Main where

import Prelude

import Effect (Effect)
import Data.Either (fromRight)
import Data.String.Regex (Regex, regex, test)
import Data.String.Regex.Flags (ignoreCase)
import Partial.Unsafe (unsafePartial)
import Turbine (Component, runComponent, use, component, output, (</>))
import Turbine.HTML as E

emailRegex :: Regex
emailRegex = unsafePartial $ fromRight $ regex ".+@.+\\..+" ignoreCase

isValidEmail :: String -> Boolean
isValidEmail = test emailRegex

validToString :: Boolean -> String
validToString = if _ then "valid" else "invalid"

app :: Component {} {}
app = component \{ email } ->
  (
    E.h1 {} (E.text "Email validator") </>
    E.input {} `use` (\o -> { email: o.value }) </>
    E.p {} (
      E.text "Email is " </>
      E.textB (validToString <$> (isValidEmail <$> email))
    )
  ) `output` {}

main :: Effect Unit
main = runComponent "#mount" app
