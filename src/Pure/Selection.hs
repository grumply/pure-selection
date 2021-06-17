{-# language CPP, ViewPatterns, OverloadedStrings, PatternSynonyms, BlockArguments, FlexibleContexts #-}
module Pure.Selection 
  ( pattern OnSelection
  , getSelection
  , setSelection
  , wrapSelection
  ) where

import Pure.Data.View.Transform (contentInRange)
import Pure.Data.View.Parse (parse)
import Pure.Data.View.Patterns (HasFeatures(..))
import Pure.Data.Lifted (Node(..),Evt,JSV(..),evtTarget,(.#))
import Pure.Data.Events (pattern OnDoc)
import Pure.Data.Txt (Txt(..))

import Data.Coerce (Coercible,coerce)

pattern OnSelection :: HasFeatures a => (Evt -> IO ()) -> a -> a
pattern OnSelection f a = OnDoc "selectionchange" f a

withSelection :: Coercible Txt a => (a -> IO ()) -> (Evt -> IO ())
withSelection f = \ev -> do
  msel <- getSelection (coerce (evtTarget ev))
  case msel of
    Just (start,end) -> do
      v <- parse (coerce (evtTarget ev))
      f (coerce (contentInRange start end v))
    _ -> 
      pure ()

getSelection :: Node -> IO (Maybe (Int,Int))
getSelection jsv = do
#ifdef __GHCJS__
  o <- get_selection_js jsv
  pure do
    start <- o .# "start"
    end <- o .# "end"
    pure (start,end)
#else
  pure Nothing
#endif

setSelection :: Node -> Int -> Int -> IO ()
setSelection node start end =
#ifdef __GHCJS__
  set_selection_js node start end
#else
  pure ()
#endif

-- I'm not sure this is a good place for this, but I don't know a 
-- better place, and it reuses some of the internal JS that 
-- `getSelection` and `setSelection` uses.
wrapSelection :: Int -> Int -> Txt -> Node -> IO ()
wrapSelection start end tag node =
#ifdef __GHCJS__
  wrap_selection_js start end tag node
#else
  pure ()
#endif

#ifdef __GHCJS__
foreign import javascript unsafe
  "$r = getRelativeSelection($1);"
    get_selection_js :: Node -> IO JSV 
    
foreign import javascript unsafe
  "setRelativeSelection($1,$2,$3);"
    set_selection_js :: Node -> Int -> Int -> IO ()
    
foreign import javascript unsafe
  "wrapSelection($4,$1,$2,$3);"
    wrap_selection_js :: Int -> Int -> Txt -> Node -> IO ()
#endif
