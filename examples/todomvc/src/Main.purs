module TodoMVC.Main where

import Prelude

import Data.Array (filter, null, snoc, length)
import Data.Traversable (fold)
import Effect (Effect)
import Hareactive.Types (Behavior, Stream, Now)
import Hareactive.Combinators as H
import Turbine (Component, modelView, output, runComponent, withStatic, (</>), list)
import Turbine.HTML as H
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
      H.input ({ value: input.clearedValue, class: H.staticClass "new-todo" } `withStatic` {
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
      H.li ({ class: H.staticClass "todo" <> H.toggleClass { completed: input.isComplete, editing: input.isEditing } }) (
        H.div ({ class: (H.staticClass "view") }) (
          H.checkbox
            ({ checked: input.isComplete
             , class: H.staticClass "toggle"
            }) `output` (\o -> { toggleTodo: o.checkedChange }) </>
          H.label {} (H.textB input.name) `output` (\o -> { startEditing: o.dblclick }) </>
          H.button { class: H.staticClass "destroy" } (H.text "") `output` (\o -> { deleteClicked: o.click })
        ) </>
        H.input ({ value: input.name, class: H.staticClass "edit" }) `output` (\o -> {
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
        H.footer { class: H.staticClass "footer" <> H.toggleClass { hidden } } (
          H.span { class: H.staticClass "footer" } (
            H.textB (formatRemainder <$> input.itemsLeft)
          ) </>
          H.ul { class: H.staticClass "filters" } (
            H.text "filters"
          ) </>
          H.button {} (H.text "Clear completed")
        )

type TodoAppModelOut = { todos :: Behavior (Array NewTodo), items :: Behavior (Array TodoItemOut) }

type TodoAppViewOut = { addItem :: Stream String, items :: Behavior (Array TodoItemOut) }

todoAppModel :: TodoAppViewOut -> Unit -> Now TodoAppModelOut
todoAppModel input _ = do
  nextId <- H.accum (+) 0 (input.addItem $> 1)
  let itemToDelete = H.shiftCurrent $ map (fold <<< map _.delete) input.items
  let newTodo = H.snapshotWith (\name id -> { name, id }) nextId input.addItem
  todos <- H.accum ($) [] (
    (flip snoc <$> newTodo) <>
    ((\id -> filter ((_ /= id) <<< (_.id))) <$> itemToDelete)
  )
  pure { todos, items: input.items }

todoAppView :: TodoAppModelOut -> Unit -> Component TodoAppViewOut _
todoAppView input _ =
  H.section { class: H.staticClass "todoapp" } (
    H.header { class: H.staticClass "header" } (
      H.h1 {} (H.text "todo") </>
      todoInput {} `output` (\o -> { addItem: o.addItem }) </>
      H.ul { class: H.staticClass "todo-list" } (
        list (\i -> todoItem i `output` identity) input.todos (_.id) `output` (\o -> { items: o })
      ) </>
      todoFooter { todos: input.items }
    )
  )
app :: Component {} TodoAppModelOut
app = modelView todoAppModel todoAppView unit

main :: Effect Unit
main = runComponent "#mount" app
