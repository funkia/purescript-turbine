module ZipCodes.Main where

import Prelude

import Affjax as AX
import Affjax.ResponseFormat as ResponseFormat
import Affjax.StatusCode (StatusCode(..))
import Data.Argonaut.Decode (class DecodeJson, decodeJson, (.:))
import Data.Array (head)
import Data.Either (fromRight, hush)
import Data.Maybe (fromMaybe)
import Data.String.Regex (Regex, regex, test)
import Data.String.Regex.Flags (ignoreCase)
import Effect (Effect)
import Effect.Aff (Aff)
import Hareactive.Combinators (changes, split, filterJust, stepper, runStreamAff)
import Partial.Unsafe (unsafePartial)
import Turbine (Component, component, output, use, runComponent, (</>), static)
import Turbine.HTML as E

zipRegex :: Regex
zipRegex = unsafePartial $ fromRight $ regex "^\\d{5}$" ignoreCase

isValidZip :: String -> Boolean
isValidZip = test zipRegex

apiUrl :: String
apiUrl = "http://api.zippopotam.us/us/"

newtype Place = Place { name :: String
                      , state :: String
                      }

instance decodeJsonAppUser :: DecodeJson Place where
  decodeJson json = do
    obj <- decodeJson json
    name <- obj .: "place name"
    state <- obj .: "state"
    pure $ Place { name, state }

type ZipResult = { places :: Array Place
                 , country :: String
                 }

fetchZip :: String -> Aff String
fetchZip zipCode = do
  res <- AX.get ResponseFormat.json (apiUrl <> zipCode)
  pure
    if res.status == StatusCode 404
    then "Zip code does not exist"
    else fromMaybe "Zip code lookup failed" $ do
      result :: ZipResult <- res.body # hush >>= (decodeJson >>> hush)
      Place place <- head result.places
      pure $ "Valid zip code for " <> place.name <> ", " <> place.state <> ", " <> result.country

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
