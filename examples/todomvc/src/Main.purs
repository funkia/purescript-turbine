module Main where

import Prelude

import Effect (Effect)
import Hareactive (Behavior, Now, Stream, changes, filter, sample, scan, snapshot, snapshotWith, stepper)
import Turbine (Component, modelView, output, runComponent, static, withStatic, (</>))
import Turbine.HTML.Elements as E
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

type TodoItemOut =
  { isComplete :: Behavior Boolean
  , taskName :: Behavior String
  }

todoItem :: {} -> Component {} TodoItemOut
todoItem = modelView model view
  where
    model input _ = do
      pure { isComplete: pure false, taskName: pure "" }
    view input =
      E.li (static { class: "todo" }) (
        E.div (static { class: "view" }) (
          E.checkbox ({ checked: input.isComplete } `withStatic` {
            class: "toggle"
            -- output: { toggleTodo: "checkedChange" },
            -- checked: input.isComplete
          }) </>
          E.label_ (E.textB input.taskName) `output` (\o -> { startEditing: o.dblclick }) </>
          E.button { class: pure "destroy" } (E.text "") `output` (\o -> { deleteClicked: o.click })
        ) </>
        E.input ({ value: input.taskName } `withStatic` { class: "edit" }) `output` (\o -> {
          newNameInput: o.input,
          nameKeyup: o.keyup,
          nameBlur: o.blur
        })
        -- actions: { focus: focusInput }
    )

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
