module TodoMVC.Main where

import Prelude

import Data.Array (filter, null, snoc, length)
import Data.Traversable (fold)
import Effect (Effect)
import Hareactive.Combinators as H
import Hareactive.Types (Behavior, Stream, Now)
import Turbine (Component, modelView, use, runComponent, withStatic, (</>), list)
import Turbine.HTML as E
import Web.UIEvent.KeyboardEvent as KE


isKey :: String -> KE.KeyboardEvent -> Boolean
isKey key event = (KE.key event) == key

type NewTodo =
  { id :: Int
  , name :: String
  }

todoInput ::  Component { clearedValue :: Behavior String, addItem :: Stream String } {}
todoInput = modelView model view
  where
    model { keyup, value } = do
      let enterPressed = H.filter (isKey "Enter") keyup
      clearedValue <- H.stepper "" ((enterPressed $> "") <> H.changes value)
      let addItem = H.filter (_ /= "") $ H.snapshot clearedValue enterPressed
      pure { clearedValue, addItem }
    view input =
      E.input ({ value: input.clearedValue, class: pure "new-todo" } `withStatic` {
        autofocus: true,
        placeholder: "What needs to be done?"
      }) `use` (\o -> { keyup: o.keyup, value: o.value })

type TodoItemOut =
  { isComplete :: Behavior Boolean
  , name :: Behavior String
  , isEditing :: Behavior Boolean
  , delete :: Stream Int
  }

todoItem :: NewTodo -> Component TodoItemOut {}
todoItem options = modelView model view
  where
    model input = do
      isComplete <- H.stepper false input.toggleTodo
      let cancelEditing = H.filter (isKey "Escape") input.nameKeyup
      let finishEditing = H.filter (isKey "Enter") input.nameKeyup
      -- Editing should stop either on enter or on escape
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
    view input =
      E.li ({ class: pure "todo"
            , classes: E.toggleClass "completed" input.isComplete
                    <> E.toggleClass "editing" input.isEditing
            }) (
        E.div ({ class: pure "view" }) (
          E.checkbox
            ({ checked: input.isComplete
             , class: pure "toggle"
            }) `use` (\o -> { toggleTodo: o.checkedChange }) </>
          E.label {} (E.textB input.name) `use` (\o -> { startEditing: o.dblclick }) </>
          E.button { class: pure "destroy" } (E.text "") `use` (\o -> { deleteClicked: o.click })
        ) </>
        E.input ({ value: input.name, class: pure "edit" }) `use` (\o -> {
          name: o.value,
          nameKeyup: o.keyup,
          nameBlur: o.blur
        })
    )

-- Footer

formatRemainder :: Int -> String
formatRemainder n = (show n) <> " item" <> (if n == 1 then "" else "s") <> " left"

todoFooter options = modelView model view
  where
    model input = do
      let itemsLeft = H.moment (\at -> length $ filter (not <<< at <<< (_.isComplete)) (at options.todos))
      pure { todos: options.todos, itemsLeft }
    view input =
      let
        hidden = map null input.todos
      in
        E.footer { class: pure "footer", classes: E.toggleClass "hidden" hidden } (
          E.span { class: pure "footer" } (
            E.textB (formatRemainder <$> input.itemsLeft)
          ) </>
          E.ul { class: pure "filters" } (
            E.text "filters"
          ) </>
          E.button {} (E.text "Clear completed")
        )

type TodoAppModelOut = { todos :: Behavior (Array NewTodo), items :: Behavior (Array TodoItemOut) }

type TodoAppViewOut = { addItem :: Stream String, items :: Behavior (Array TodoItemOut) }

todoAppModel :: TodoAppViewOut -> Now TodoAppModelOut
todoAppModel input = do
  nextId <- H.accum (+) 0 (input.addItem $> 1)
  let itemToDelete = H.shiftCurrent $ map (fold <<< map _.delete) input.items
  let newTodo = H.snapshotWith (\name id -> { name, id }) nextId input.addItem
  todos <- H.accum ($) [] (
    (flip snoc <$> newTodo) <>
    ((\id -> filter ((_ /= id) <<< (_.id))) <$> itemToDelete)
  )
  pure { todos, items: input.items }

todoAppView :: TodoAppModelOut -> Component _ TodoAppViewOut
todoAppView input =
  E.section { class: pure "todoapp" } (
    E.header { class: pure "header" } (
      E.h1 {} (E.text "todo") </>
      todoInput `use` (\o -> { addItem: o.addItem }) </>
      E.ul { class: pure "todo-list" } (
        list (\i -> todoItem i `use` identity) input.todos (_.id) `use` (\o -> { items: o })
      ) </>
      todoFooter { todos: input.items }
    )
  )
app :: Component TodoAppModelOut {}
app = modelView todoAppModel todoAppView

main :: Effect Unit
main = runComponent "#mount" app
