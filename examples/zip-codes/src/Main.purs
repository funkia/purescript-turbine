module Main where

import Prelude

import Data.Argonaut.Core as J
import Data.Either (Either(..))
import Data.HTTP.Method (Method(..))
import Data.Number (fromString)
import Data.Either (fromRight, hush)
import Effect (Effect)
import Effect.Aff (Aff, launchAff)
import Effect.Class (liftEffect)
import Effect.Console (log)
import Partial.Unsafe (unsafePartial)
import Data.Tuple (Tuple(..))
import Hareactive (Behavior, Stream, Now, changes, split, filterJust, sample, stepper, filter, runStreamAff)
import Network.HTTP.Affjax as AX
import Network.HTTP.Affjax.Response as AXRes
import Network.HTTP.StatusCode (StatusCode(..))
import Data.String.Regex (Regex, regex, test)
import Data.String.Regex.Flags (ignoreCase)
import Turbine (Component, modelView, output, runComponent, (</>))
import Turbine.HTML.Elements as E
import Turbine.HTML.Properties as P

type AppModelOut =
  { status :: Behavior String
  }

type AppViewOut =
  { zipCode :: Behavior String
  }

zipRegex :: Regex
zipRegex = unsafePartial $ fromRight $ regex "^\\d{5}$" ignoreCase

isValidZip :: String -> Boolean
isValidZip = test zipRegex

apiUrl = "http://api.zippopotam.us/us/"

fetchZip :: String -> Aff String
fetchZip zipCode = do
  res <- AX.get AXRes.json (apiUrl <> zipCode)
  liftEffect $ log $ "GET, status: " <> show res.status <> ", response: " <> J.stringify res.response
  pure if res.status == StatusCode 404
       then "Zip code does not exist"
       else "Valid zip code for " <> "Foo"

zipModel { zipCode } _ = do
  let
    zipCodeChange = changes zipCode
    Tuple validZipCodeChange invalidZipCodeChange = split isValidZip zipCodeChange
  fetchResult <- runStreamAff $ map fetchZip validZipCodeChange
  let
    statusChange =
      (invalidZipCodeChange $> "Not a valid zip code") <>
      (validZipCodeChange $> "Loading ...") <>
      (filterJust $ hush <$> fetchResult)
  status <- sample $ stepper "" statusChange
  pure { status }

zipView { status } =
  E.div_ (
    E.span_ (E.text "Please type a valid US zip code: ") </>
    E.input [ P.attribute "placeholder" "Zip code" ] `output` (\o -> { zipCode: o.inputValue }) </>
    E.br </>
    E.span_ (E.textB status)
  )

app :: Component {} AppModelOut
app = modelView zipModel zipView unit

main :: Effect Unit
main = runComponent "#mount" app