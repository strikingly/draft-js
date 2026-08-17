/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

var DOMObserver = require("./DOMObserver");

var DraftModifier = require("./DraftModifier");

var DraftOffsetKey = require("./DraftOffsetKey");

var EditorState = require("./EditorState");

var Keys = require("fbjs/lib/Keys");

var UserAgent = require("fbjs/lib/UserAgent");

var editOnSelect = require("./editOnSelect");

var getContentEditableContainer = require("./getContentEditableContainer");

var getDraftEditorSelection = require("./getDraftEditorSelection");

var getEntityKeyForSelection = require("./getEntityKeyForSelection");

var getWindowForNode = require("./getWindowForNode");

var nullthrows = require("fbjs/lib/nullthrows");

var isIE = UserAgent.isBrowser('IE');
/**
 * Millisecond delay to allow `compositionstart` to fire again upon
 * `compositionend`.
 *
 * This is used for Korean input to ensure that typing can continue without
 * the editor trying to render too quickly. More specifically, Safari 7.1+
 * triggers `compositionstart` a little slower than Chrome/FF, which
 * leads to composed characters being resolved and re-render occurring
 * sooner than we want.
 */

var RESOLVE_DELAY = 20;
/**
 * A handful of variables used to track the current composition and its
 * resolution status. These exist at the module level because it is not
 * possible to have compositions occurring in multiple editors simultaneously,
 * and it simplifies state management with respect to the DraftEditor component.
 */

var resolved = false;
var stillComposing = false;
var domObserver = null;
var compositionSnapshot = null;

function startDOMObserver(editor) {
  if (!domObserver) {
    domObserver = new DOMObserver(getContentEditableContainer(editor));
    domObserver.start();
  }
}

function findCompositionBlockNode(node, container) {
  var searchNode = node;

  while (searchNode && searchNode !== container) {
    if (searchNode instanceof HTMLElement && searchNode.getAttribute('data-block') === 'true') {
      return searchNode;
    }

    searchNode = searchNode.parentNode;
  }

  return null;
}

function getCompositionBlockNode(editor, editorState) {
  var container = getContentEditableContainer(editor);

  if (!container) {
    return null;
  }

  var selection = getWindowForNode(container).getSelection();

  if (selection && selection.rangeCount > 0) {
    var blockNode = findCompositionBlockNode(selection.anchorNode, container);

    if (blockNode) {
      return blockNode;
    }
  }

  var blockKey = editorState.getSelection().getAnchorKey();

  if (!blockKey) {
    return null;
  }

  var leaf = container.querySelector("[data-offset-key^=\"".concat(blockKey, "-\"]"));
  return findCompositionBlockNode(leaf, container);
}

function getCompositionDOMSelection(blockNode) {
  var selection = getWindowForNode(blockNode).getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  var range = selection.getRangeAt(0);

  if (!blockNode.contains(range.commonAncestorContainer)) {
    return null;
  }

  try {
    var startRange = range.cloneRange();
    startRange.selectNodeContents(blockNode);
    startRange.setEnd(range.startContainer, range.startOffset);
    var startOffset = startRange.toString().length;
    var endRange = range.cloneRange();
    endRange.selectNodeContents(blockNode);
    endRange.setEnd(range.endContainer, range.endOffset);
    var endOffset = endRange.toString().length;
    return {
      startOffset: startOffset,
      endOffset: endOffset
    };
  } catch (_e) {
    return null;
  }
}

function getCompositionTextFromDOM(startText, endText, domSelection) {
  if (domSelection && domSelection.startOffset >= 0 && domSelection.startOffset <= domSelection.endOffset && domSelection.endOffset <= startText.length) {
    var startPrefix = startText.slice(0, domSelection.startOffset);
    var startSuffix = startText.slice(domSelection.endOffset);
    var composedLength = Math.max(0, endText.length - startPrefix.length - startSuffix.length);

    var _composedText = endText.slice(domSelection.startOffset, domSelection.startOffset + composedLength);

    if (_composedText && endText === startPrefix + _composedText + startSuffix) {
      return _composedText;
    }
  }

  if (endText.length < startText.length) {
    return null;
  }

  var prefixLength = 0;
  var maxPrefixLength = Math.min(startText.length, endText.length);

  while (prefixLength < maxPrefixLength && startText[prefixLength] === endText[prefixLength]) {
    prefixLength += 1;
  }

  var suffixLength = 0;

  while (suffixLength < startText.length - prefixLength && suffixLength < endText.length - prefixLength && startText[startText.length - 1 - suffixLength] === endText[endText.length - 1 - suffixLength]) {
    suffixLength += 1;
  }

  var composedText = endText.slice(prefixLength, endText.length - suffixLength);

  if (!composedText) {
    return null;
  }

  var rebuiltText = startText.slice(0, prefixLength) + composedText + startText.slice(prefixLength);
  return rebuiltText === endText ? composedText : null;
}

function captureCompositionSnapshot(editor) {
  var editorState = editor._latestEditorState;

  if (!editorState) {
    return null;
  }

  var blockKey = editorState.getSelection().getAnchorKey();

  if (!blockKey) {
    return null;
  }

  var blockNode = getCompositionBlockNode(editor, editorState);
  return {
    editor: editor,
    editorState: editorState,
    blockNode: blockNode,
    blockText: blockNode ? blockNode.textContent : null,
    domSelection: blockNode ? getCompositionDOMSelection(blockNode) : null,
    composedText: null
  };
}

function getComposedText(snapshot) {
  if (snapshot.composedText != null && snapshot.composedText !== '') {
    return snapshot.composedText;
  }

  var blockNode = snapshot.blockNode,
      blockText = snapshot.blockText,
      domSelection = snapshot.domSelection;

  if (!blockNode || typeof blockText !== 'string') {
    return null;
  }

  var endText = blockNode.textContent || '';
  return getCompositionTextFromDOM(blockText, endText, domSelection) || getCompositionTextFromDOM(blockText, endText);
}

function buildRepairedEditorState(snapshot, composedText) {
  if (!composedText) {
    return null;
  }

  var prevEditorState = snapshot.editorState;
  var prevSelection = prevEditorState.getSelection();
  var prevContent = prevEditorState.getCurrentContent();
  var anchorKey = prevSelection.getAnchorKey();

  if (!anchorKey || prevSelection.getStartKey() !== prevSelection.getEndKey()) {
    return null;
  }

  if (!prevContent.getBlockForKey(anchorKey)) {
    return null;
  }

  var entityKey = getEntityKeyForSelection(prevContent, prevSelection);
  var currentStyle = prevEditorState.getCurrentInlineStyle();
  var contentWithText = prevSelection.isCollapsed() ? DraftModifier.insertText(prevContent, prevSelection, composedText, currentStyle, entityKey) : DraftModifier.replaceText(prevContent, prevSelection, composedText, currentStyle, entityKey);
  var newOffset = prevSelection.getStartOffset() + composedText.length;
  var newSelection = prevSelection.merge({
    anchorOffset: newOffset,
    focusOffset: newOffset,
    isBackward: false
  });
  var pushed = EditorState.push(prevEditorState, contentWithText, 'insert-characters');
  var outOfComposition = EditorState.set(pushed, {
    inCompositionMode: false,
    nativelyRenderedContent: null
  });
  return EditorState.forceSelection(outOfComposition, newSelection);
}

var DraftEditorCompositionHandler = {
  /**
   * A `compositionstart` event has fired while we're still in composition
   * mode. Continue the current composition session to prevent a re-render.
   */
  onCompositionStart: function onCompositionStart(editor) {
    stillComposing = true;
    startDOMObserver(editor);
    compositionSnapshot = captureCompositionSnapshot(editor);
  },

  /**
   * Attempt to end the current composition session.
   *
   * Defer handling because browser will still insert the chars into active
   * element after `compositionend`. If a `compositionstart` event fires
   * before `resolveComposition` executes, our composition session will
   * continue.
   *
   * The `resolved` flag is useful because certain IME interfaces fire the
   * `compositionend` event multiple times, thus queueing up multiple attempts
   * at handling the composition. Since handling the same composition event
   * twice could break the DOM, we only use the first event. Example: Arabic
   * Google Input Tools on Windows 8.1 fires `compositionend` three times.
   */
  onCompositionEnd: function onCompositionEnd(editor, e) {
    resolved = false;
    stillComposing = false;

    if (compositionSnapshot && e && e.data) {
      compositionSnapshot.composedText = e.data;
    }

    setTimeout(function () {
      if (!resolved) {
        DraftEditorCompositionHandler.resolveComposition(editor);
      }
    }, RESOLVE_DELAY);
  },
  onSelect: editOnSelect,

  /**
   * In Safari, keydown events may fire when committing compositions. If
   * the arrow keys are used to commit, prevent default so that the cursor
   * doesn't move, otherwise it will jump back noticeably on re-render.
   */
  onKeyDown: function onKeyDown(editor, e) {
    if (!stillComposing) {
      // This check was added in D23734060. Seemingly, we should be checking
      // to see if the resolved flag is false here, otherwise the below
      // comment doesn't make sense. With this change, it should prevent
      // over-firing the resolveComposition() method, which might help fix
      // some existing IME issues.
      if (!resolved) {
        // If a keydown event is received after compositionend but before the
        // 20ms timer expires (ex: type option-E then backspace, or type A then
        // backspace in 2-Set Korean), we should immediately resolve the
        // composition and reinterpret the key press in edit mode.
        DraftEditorCompositionHandler.resolveComposition(editor);
      }

      editor._onKeyDown(e);

      return;
    }

    if (e.which === Keys.RIGHT || e.which === Keys.LEFT) {
      e.preventDefault();
    }
  },

  /**
   * Keypress events may fire when committing compositions. In Firefox,
   * pressing RETURN commits the composition and inserts extra newline
   * characters that we do not want. `preventDefault` allows the composition
   * to be committed while preventing the extra characters.
   */
  onKeyPress: function onKeyPress(_editor, e) {
    if (e.which === Keys.RETURN) {
      e.preventDefault();
    }
  },

  /**
   * Attempt to insert composed characters into the document.
   *
   * If we are still in a composition session, do nothing. Otherwise, insert
   * the characters into the document and terminate the composition session.
   *
   * If no characters were composed -- for instance, the user
   * deleted all composed characters and committed nothing new --
   * force a re-render. We also re-render when the composition occurs
   * at the beginning of a leaf, to ensure that if the browser has
   * created a new text node for the composition, we will discard it.
   *
   * Resetting innerHTML will move focus to the beginning of the editor,
   * so we update to force it back to the correct place.
   */
  resolveComposition: function resolveComposition(editor) {
    if (stillComposing) {
      return;
    }

    var lastEditorState = editor._latestEditorState;
    var mutations = nullthrows(domObserver).stopAndFlushMutations();
    domObserver = null;
    resolved = true;
    var editorState = EditorState.set(lastEditorState, {
      inCompositionMode: false
    });
    editor.exitCurrentMode();

    if (!mutations.size) {
      compositionSnapshot = null;
      editor.update(editorState);
      return;
    } // TODO, check if Facebook still needs this flag or if it could be removed.
    // Since there can be multiple mutations providing a `composedChars` doesn't
    // apply well on this new model.
    // if (
    //   gkx('draft_handlebeforeinput_composed_text') &&
    //   editor.props.handleBeforeInput &&
    //   isEventHandled(
    //     editor.props.handleBeforeInput(
    //       composedChars,
    //       editorState,
    //       event.timeStamp,
    //     ),
    //   )
    // ) {
    //   return;
    // }


    var contentState = editorState.getCurrentContent();
    mutations.forEach(function (composedChars, offsetKey) {
      var _DraftOffsetKey$decod = DraftOffsetKey.decode(offsetKey),
          blockKey = _DraftOffsetKey$decod.blockKey,
          decoratorKey = _DraftOffsetKey$decod.decoratorKey,
          leafKey = _DraftOffsetKey$decod.leafKey;

      var _editorState$getBlock = editorState.getBlockTree(blockKey).getIn([decoratorKey, 'leaves', leafKey]),
          start = _editorState$getBlock.start,
          end = _editorState$getBlock.end;

      var replacementRange = editorState.getSelection().merge({
        anchorKey: blockKey,
        focusKey: blockKey,
        anchorOffset: start,
        focusOffset: end,
        isBackward: false
      });
      var entityKey = getEntityKeyForSelection(contentState, replacementRange);
      var currentStyle = contentState.getBlockForKey(blockKey).getInlineStyleAt(start);
      contentState = DraftModifier.replaceText(contentState, replacementRange, composedChars, currentStyle, entityKey); // We need to update the editorState so the leaf node ranges are properly
      // updated and multiple mutations are correctly applied.

      editorState = EditorState.set(editorState, {
        currentContent: contentState
      });
    });
    var snapshot = compositionSnapshot;
    compositionSnapshot = null;

    if (snapshot) {
      var composedText = getComposedText(snapshot);

      if (composedText != null && composedText !== '') {
        var repairedEditorState = buildRepairedEditorState(snapshot, composedText);

        if (repairedEditorState && !repairedEditorState.getCurrentContent().getBlockMap().equals(contentState.getBlockMap())) {
          // The browser sometimes commits composed text as a new text node
          // whose nearest offset key is not the leaf containing the caret.
          // Rebuild from the pre-composition snapshot instead of applying the
          // misattributed mutation result.
          editor.restoreEditorDOM();
          editor.update(repairedEditorState);
          return;
        }
      }
    } // When we apply the text changes to the ContentState, the selection always
    // goes to the end of the field, but it should just stay where it is
    // after compositionEnd. We also apply this to the last editor state, rather
    // than the new editor state in order to avoid problems that might come from
    // race conditions around calculating ranges from mutations when processing
    // the mutations above. If the ranges are off, for example, using mentions
    // in IME mode, then the selection will move the cursor to an invalid range.
    // See D23905960 for more context:


    var documentSelection = getDraftEditorSelection(lastEditorState, getContentEditableContainer(editor));
    var compositionEndSelectionState = documentSelection.selectionState;
    editor.restoreEditorDOM(); // See:
    // - https://github.com/facebook/draft-js/issues/2093
    // - https://github.com/facebook/draft-js/pull/2094
    // Apply this fix only in IE for now. We can test it in
    // other browsers in the future to ensure no regressions

    var editorStateWithUpdatedSelection = isIE ? EditorState.forceSelection(editorState, compositionEndSelectionState) : EditorState.acceptSelection(editorState, compositionEndSelectionState);
    editor.update(EditorState.push(editorStateWithUpdatedSelection, contentState, 'insert-characters'));
  }
};
module.exports = DraftEditorCompositionHandler;