module Main where

import Prelude

import Effect (Effect)
import Data.Either (fromRight)
import Data.Hareactive (Behavior, Now)
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
validToString b = if b then "valid" else "invalid"

type AppModelOut = { isValid :: Behavior Boolean }

type AppViewOut = { email :: Behavior String }

appModel :: AppViewOut -> Unit -> Now AppModelOut
appModel {email} _ = pure { isValid: isValidEmail <$> email }

appView :: AppModelOut -> Component AppViewOut AppViewOut
appView {isValid} =
  E.h1_ (E.text "Email validator") </>
  E.input_ `output` (\o -> { email: o.inputValue }) </>
  E.p_ (
    E.text "Email is " </>
    E.textB (validToString <$> isValid)
  )

app :: Component {} { isValid :: Behavior Boolean }
app = modelView appModel appView unit

main :: Effect Unit
main = runComponent "#mount" app
