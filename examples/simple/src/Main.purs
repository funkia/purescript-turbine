module Main where

import Prelude

import Control.Monad.Eff (Eff)
import Data.Either (fromLeft, fromRight)
import Data.Hareactive (Behavior, Stream, Now, sample, stepper)
import Data.String.Regex (Regex, regex, test)
import Data.String.Regex.Flags (ignoreCase)
import Partial.Unsafe (unsafePartial)
import Turbine (Component, runComponent, dynamic, output, modelView, (\>))
import Turbine.HTML.Elements as E

emailRegex :: Regex
emailRegex = unsafePartial $ fromRight $ regex ".+@.+\\..+" ignoreCase

isValidEmail :: String -> Boolean
isValidEmail = test emailRegex

validToString :: Boolean -> String
validToString b = if b then "valid" else "invalid"

type AppModelOut = {isValid :: Behavior Boolean}

type AppViewOut = {email :: Behavior String}

appModel :: AppViewOut -> Unit -> Now AppModelOut
appModel {email} _ = do
  let isValid = isValidEmail <$> email
  pure {isValid}

appView :: AppModelOut -> Component _ AppViewOut
appView {isValid} =
  E.h1_ $ E.text "Email validator" \>
  E.input_ `output` (\o -> {email: o.inputValue}) \>
  E.p_ (
    E.text "Email is " \>
    E.textB (validToString <$> isValid)
  )

app = modelView appModel appView unit

main :: Eff _ Unit
main = runComponent "#mount" app
