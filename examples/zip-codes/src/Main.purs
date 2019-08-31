module ZipCodes.Main where

import Prelude

import Data.Either (Either(..), fromRight, hush)
import Effect (Effect)
import Effect.Aff (Aff)
import Partial.Unsafe (unsafePartial)
import Hareactive.Combinators (changes, split, filterJust, stepper, runStreamAff)
import Affjax as AX
import Affjax.ResponseFormat as ResponseFormat
import Affjax.StatusCode (StatusCode(..))
import Data.String.Regex (Regex, regex, test)
import Data.String.Regex.Flags (ignoreCase)
import Turbine (Component, component, output, use, runComponent, (</>), static)
import Turbine.HTML as E

zipRegex :: Regex
zipRegex = unsafePartial $ fromRight $ regex "^\\d{5}$" ignoreCase

isValidZip :: String -> Boolean
isValidZip = test zipRegex

apiUrl :: String
apiUrl = "http://api.zippopotam.us/us/"

fetchZip :: String -> Aff String
fetchZip zipCode = do
  res <- AX.get ResponseFormat.json (apiUrl <> zipCode)
  pure (case res.body of
    Left _ -> "JSON parse error"
    Right json ->
      if res.status == StatusCode 404
      then "Zip code does not exist"
      else "Valid zip code" -- TODO: Extract the city name from JSON here.
       )

app :: Component {} {}
app = component \on -> do
  let zipCodeChange = changes on.zipCode
      { pass: validZipCodeChange, fail: invalidZipCodeChange } = split isValidZip zipCodeChange
  fetchResult <- runStreamAff $ map fetchZip validZipCodeChange
  let statusChange =
        (invalidZipCodeChange $> "Not a valid zip code") <>
        (validZipCodeChange $> "Loading ...") <>
        (fetchResult <#> hush # filterJust)
  status <- stepper "" statusChange
  ( E.div {} (
      E.span {} (E.text "Please type a valid US zip code: ") </>
      E.input (static { placeholder: "Zip code" }) `use` (\o -> { zipCode: o.value }) </>
      E.br </>
      E.span {} (E.textB status)
    )
  ) `output` {}

main :: Effect Unit
main = runComponent "#mount" app
