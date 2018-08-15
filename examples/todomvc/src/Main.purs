module Main where

import Prelude

import Effect (Effect)
import Hareactive (Behavior, Now, sample, stepper, filter, changes)
import Turbine (Component, modelView, output, runComponent, static, withStatic, (</>))
import Turbine.HTML.Elements as E
import Web.UIEvent.KeyboardEvent as KE

isEnter :: KE.KeyboardEvent -> Boolean
isEnter = (_ == "Enter") <<< KE.key

todoInput :: {} -> Component {} { clearedValue :: Behavior String }
todoInput = modelView model view
  where
    model { keyup, value } {} = do
      let enterPressed = filter isEnter keyup
      clearedValue <- sample $ stepper "" ((enterPressed $> "") <> changes value)
      pure { clearedValue }
    view o =
      E.input ({ value: o.clearedValue } `withStatic` {
        class: "new-todo",
        autofocus: true,
        placeholder: "What needs to be done?"
      }) `output` (\o -> { keyup: o.keyup, value: o.inputValue })

type TodoAppModelOut = { }

type TodoAppViewOut = { }

todoAppModel :: TodoAppViewOut -> Unit -> Now TodoAppModelOut
todoAppModel {} _ = pure {}

todoAppView :: TodoAppModelOut -> Component TodoAppViewOut TodoAppViewOut
todoAppView {} =
  E.section { class: pure "todoapp" } (
    E.header { class: pure "header" } (
      E.h1_ (E.text "todo") </>
      todoInput {}
    )
  )
app :: Component {} {}
app = modelView todoAppModel todoAppView unit

main :: Effect Unit
main = runComponent "#mount" app
