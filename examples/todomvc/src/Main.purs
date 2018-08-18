module Main where

import Prelude

import Effect (Effect)
import Hareactive (Behavior, Now, Stream, changes, filter, sample, scan, snapshot, snapshotWith, stepper)
import Turbine (Component, modelView, output, runComponent, static, withStatic, (</>))
import Turbine.HTML.Elements as E
import Web.HTML.HTMLVideoElement (videoWidth)
import Web.UIEvent.KeyboardEvent as KE

isEnter :: KE.KeyboardEvent -> Boolean
isEnter = (_ == "Enter") <<< KE.key

todoInput :: {} -> Component {} { clearedValue :: Behavior String, addItem :: Stream String }
todoInput = modelView model view
  where
    model { keyup, value } {} = do
      let enterPressed = filter isEnter keyup
      clearedValue <- sample $ stepper "" ((enterPressed $> "") <> changes value)
      let addItem = filter (_ == "") $ snapshot clearedValue enterPressed
      pure { clearedValue, addItem }
    view input =
      E.input ({ value: input.clearedValue } `withStatic` {
        class: "new-todo",
        autofocus: true,
        placeholder: "What needs to be done?"
      }) `output` (\o -> { keyup: o.keyup, value: o.inputValue })

todoItem = modelView model view
  where
    model input = do
      pure {}
    view input =
      E.li (static { class: "todo" }) (
        E.div { class: "view" } (
          E.checkbox {
            class: "toggle",
            output: { toggleTodo: "checkedChange" },
            props: { checked: isComplete }
          } </>
          E.label_ (E.textB taskName) `output` (\o -> { startEditing: o.dblclick }) </>
          E.button_ { class: "destroy" } `output` (\o -> { deleteClicked: o.click })
        )
      ) </>
      E.input ({ value: taskName } `withStatic` { class: "edit" }) `output` (\o -> {
          newNameInput: o.input,
          nameKeyup: o.keyup,
          nameBlur: o.blur
        })
        -- actions: { focus: focusInput }

type TodoAppModelOut = {}

type TodoAppViewOut = { addItem :: Stream String }

todoAppModel :: TodoAppViewOut -> Unit -> Now TodoAppModelOut
todoAppModel input _ = do
  nextId <- sample $ scan (+) 0 (input.addItem $> 1)
  let newTodoS = snapshotWith (\name id -> { name, id }) nextId input.addItem
  pure {}

todoAppView :: TodoAppModelOut -> Component TodoAppViewOut TodoAppViewOut
todoAppView {} =
  E.section { class: pure "todoapp" } (
    E.header { class: pure "header" } (
      E.h1_ (E.text "todo") </>
      todoInput {} `output` (\o -> { addItem: o.addItem })
    )
  )
app :: Component {} {}
app = modelView todoAppModel todoAppView unit

main :: Effect Unit
main = runComponent "#mount" app
