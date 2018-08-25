module Main where

import Prelude

import Data.Array (snoc)
import Effect (Effect)
import Hareactive as H
import Turbine (Component, modelView, output, runComponent, withStatic, (</>), list)
import Turbine.HTML.Elements as E
import Web.UIEvent.KeyboardEvent as KE


isKey :: String -> KE.KeyboardEvent -> Boolean
isKey key event = (KE.key event) == key

type NewTodo =
  { id :: Int
  , name :: String
  }

todoInput :: {} -> Component {} { clearedValue :: H.Behavior String, addItem :: H.Stream String }
todoInput = modelView model view
  where
    model { keyup, value } {} = do
      let enterPressed = H.filter (isKey "Enter") keyup
      clearedValue <- H.sample $ H.stepper "" ((enterPressed $> "") <> H.changes value)
      let addItem = H.filter (_ /= "") $ H.snapshot clearedValue enterPressed
      pure { clearedValue, addItem }
    view input =
      E.input ({ value: input.clearedValue, class: E.staticClass "new-todo" } `withStatic` {
        autofocus: true,
        placeholder: "What needs to be done?"
      }) `output` (\o -> { keyup: o.keyup, value: o.inputValue })

type TodoItemOut =
  { isComplete :: H.Behavior Boolean
  , name :: H.Behavior String
  , isEditing :: H.Behavior Boolean
  }

todoItem :: NewTodo -> Component {} TodoItemOut
todoItem = modelView model view
  where
    model input options = do
      isComplete <- H.sample $ H.stepper false input.toggleTodo
      let cancelEditing = H.filter (isKey "Escape") input.nameKeyup
      let finishEditing = H.filter (isKey "Enter") input.nameKeyup
      -- Editing should stop if either on enter or on escape
      let stopEditing = cancelEditing <> finishEditing
      -- The name when editing started
      initialName <- H.sample $ H.stepper "" (H.snapshot input.name input.startEditing)
      -- When editing is canceled the name should be reset to what is was when
      -- editing begun.
      let cancelName = H.snapshot initialName cancelEditing
      isEditing <- H.sample $ H.toggle false (input.startEditing) stopEditing
      name <- H.sample $ H.stepper options.name (H.changes input.name <> cancelName)
      pure { isComplete, name, isEditing }
    view input =
      E.li ({ class: E.staticClass "todo" <> E.toggleClass { completed: input.isComplete, editing: input.isEditing } }) (
        E.div ({ class: (E.staticClass "view") }) (
          E.checkbox
            ({ checked: input.isComplete
             , class: E.staticClass "toggle"
            }) `output` (\o -> { toggleTodo: o.checkedChange }) </>
          E.label_ (E.textB input.name) `output` (\o -> { startEditing: o.dblclick }) </>
          E.button { class: E.staticClass "destroy" } (E.text "") `output` (\o -> { deleteClicked: o.click })
        ) </>
        E.input ({ value: input.name, class: E.staticClass "edit" }) `output` (\o -> {
          name: o.inputValue,
          nameKeyup: o.keyup,
          nameBlur: o.blur
        })
    )

type TodoAppModelOut = { todos :: H.Behavior (Array NewTodo) }

type TodoAppViewOut = { addItem :: H.Stream String }

todoAppModel :: TodoAppViewOut -> Unit -> H.Now TodoAppModelOut
todoAppModel input _ = do
  nextId <- H.sample $ H.scan (+) 0 (input.addItem $> 1)
  let newTodo = H.snapshotWith (\name id -> { name, id }) nextId input.addItem
  todos <- H.sample $ H.scan (flip snoc) [] newTodo
  pure { todos }

todoAppView :: TodoAppModelOut -> Component TodoAppViewOut TodoAppViewOut
todoAppView input =
  E.section { class: E.staticClass "todoapp" } (
    E.header { class: E.staticClass "header" } (
      E.h1_ (E.text "todo") </>
      todoInput {} `output` (\o -> { addItem: o.addItem }) </>
      E.ul { class: E.staticClass "todo-list" } (
        list todoItem input.todos (_.id)
      )
    )
  )
app :: Component {} TodoAppModelOut
app = modelView todoAppModel todoAppView unit

main :: Effect Unit
main = runComponent "#mount" app
