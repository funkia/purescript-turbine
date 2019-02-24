module TodoMVC.Main where

import Prelude

import Data.Array (filter, null, snoc, length)
import Data.Traversable (fold)
import Effect (Effect)
import Hareactive.Types (Behavior, Stream, Now)
import Hareactive.Combinators as H
import Turbine (Component, modelView, output, runComponent, withStatic, (</>), list)
import Turbine.HTML.Elements as E
import Web.UIEvent.KeyboardEvent as KE


isKey :: String -> KE.KeyboardEvent -> Boolean
isKey key event = (KE.key event) == key

type NewTodo =
  { id :: Int
  , name :: String
  }

todoInput :: {} -> Component {} { clearedValue :: Behavior String, addItem :: Stream String }
todoInput = modelView model view
  where
    model { keyup, value } {} = do
      let enterPressed = H.filter (isKey "Enter") keyup
      clearedValue <- H.stepper "" ((enterPressed $> "") <> H.changes value)
      let addItem = H.filter (_ /= "") $ H.snapshot clearedValue enterPressed
      pure { clearedValue, addItem }
    view input _ =
      E.input ({ value: input.clearedValue, class: E.staticClass "new-todo" } `withStatic` {
        autofocus: true,
        placeholder: "What needs to be done?"
      }) `output` (\o -> { keyup: o.keyup, value: o.value })

type TodoItemOut =
  { isComplete :: Behavior Boolean
  , name :: Behavior String
  , isEditing :: Behavior Boolean
  , delete :: Stream Int
  }

todoItem :: NewTodo -> Component {} TodoItemOut
todoItem = modelView model view
  where
    model input options = do
      isComplete <- H.stepper false input.toggleTodo
      let cancelEditing = H.filter (isKey "Escape") input.nameKeyup
      let finishEditing = H.filter (isKey "Enter") input.nameKeyup
      -- Editing should stop if either on enter or on escape
      let stopEditing = cancelEditing <> finishEditing
      -- The name when editing started
      initialName <- H.stepper "" (H.snapshot input.name input.startEditing)
      -- When editing is canceled the name should be reset to what is was when
      -- editing begun.
      let cancelName = H.snapshot initialName cancelEditing
      isEditing <- H.toggle false (input.startEditing) stopEditing
      name <- H.stepper options.name (H.changes input.name <> cancelName)
      -- If the delete button is clicked we should signal to parent
      let delete = input.deleteClicked $> options.id
      pure { isComplete, name, isEditing, delete }
    view input _ =
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
          name: o.value,
          nameKeyup: o.keyup,
          nameBlur: o.blur
        })
    )

-- Footer

formatRemainder :: Int -> String
formatRemainder n = (show n) <> " item" <> (if n == 1 then "" else "s") <> " left"

todoFooter = modelView model view
  where
    model input options = do
      let itemsLeft = H.moment (\at -> length $ filter (not <<< at <<< (_.isComplete)) (at options.todos))
      pure { todos: options.todos, itemsLeft }
    view input _ =
      let
        hidden = map null input.todos
      in
        E.footer { class: E.staticClass "footer" <> E.toggleClass { hidden } } (
          E.span { class: E.staticClass "footer" } (
            E.textB (formatRemainder <$> input.itemsLeft)
          ) </>
          E.ul { class: E.staticClass "filters" } (
            E.text "filters"
          ) </>
          E.button {} (E.text "Clear completed")
        )

type TodoAppModelOut = { todos :: Behavior (Array NewTodo), items :: Behavior (Array TodoItemOut) }

type TodoAppViewOut = { addItem :: Stream String, items :: Behavior (Array TodoItemOut) }

todoAppModel :: TodoAppViewOut -> Unit -> Now TodoAppModelOut
todoAppModel input _ = do
  nextId <- H.scan (+) 0 (input.addItem $> 1)
  let itemToDelete = H.switchStream $ map (fold <<< map _.delete) input.items
  let newTodo = H.snapshotWith (\name id -> { name, id }) nextId input.addItem
  todos <- H.scan ($) [] (
    (flip snoc <$> newTodo) <>
    ((\id -> filter ((_ /= id) <<< (_.id))) <$> itemToDelete)
  )
  pure { todos, items: input.items }

todoAppView :: TodoAppModelOut -> Unit -> Component TodoAppViewOut _
todoAppView input _ =
  E.section { class: E.staticClass "todoapp" } (
    E.header { class: E.staticClass "header" } (
      E.h1_ (E.text "todo") </>
      todoInput {} `output` (\o -> { addItem: o.addItem }) </>
      E.ul { class: E.staticClass "todo-list" } (
        list (\i -> todoItem i `output` identity) input.todos (_.id) `output` (\o -> { items: o })
      ) </>
      todoFooter { todos: input.items }
    )
  )
app :: Component {} TodoAppModelOut
app = modelView todoAppModel todoAppView unit

main :: Effect Unit
main = runComponent "#mount" app
