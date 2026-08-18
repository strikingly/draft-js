/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';
import type EditorStateType from 'EditorState';

const DOMObserver = require('DOMObserver');
const DraftModifier = require('DraftModifier');
const DraftOffsetKey = require('DraftOffsetKey');
const EditorState = require('EditorState');
const Keys = require('Keys');
const UserAgent = require('UserAgent');

const editOnSelect = require('editOnSelect');
const getContentEditableContainer = require('getContentEditableContainer');
const getDraftEditorSelection = require('getDraftEditorSelection');
const getEntityKeyForSelection = require('getEntityKeyForSelection');
const getWindowForNode = require('getWindowForNode');
const nullthrows = require('nullthrows');

const isIE = UserAgent.isBrowser('IE');

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
const RESOLVE_DELAY = 20;

/**
 * A handful of variables used to track the current composition and its
 * resolution status. These exist at the module level because it is not
 * possible to have compositions occurring in multiple editors simultaneously,
 * and it simplifies state management with respect to the DraftEditor component.
 */
let resolved = false;
let stillComposing = false;
let domObserver = null;
let resolveTimer = null;

type CompositionDOMSelection = {
  startOffset: number,
  endOffset: number,
};

type CompositionSnapshot = {
  editor: DraftEditor,
  editorState: EditorStateType,
  blockNode: ?HTMLElement,
  blockText: ?string,
  domSelection: ?CompositionDOMSelection,
  composedText: ?string,
};

let compositionSnapshot: ?CompositionSnapshot = null;

function startDOMObserver(editor: DraftEditor) {
  if (!domObserver) {
    domObserver = new DOMObserver(getContentEditableContainer(editor));
    domObserver.start();
  }
}

function findCompositionBlockNode(
  node: ?Node,
  container: HTMLElement,
): ?HTMLElement {
  let searchNode = node;
  while (searchNode && searchNode !== container) {
    if (
      searchNode instanceof HTMLElement &&
      searchNode.getAttribute('data-block') === 'true'
    ) {
      return searchNode;
    }
    searchNode = searchNode.parentNode;
  }
  return null;
}

function getCompositionBlockNode(
  editor: DraftEditor,
  editorState: EditorStateType,
): ?HTMLElement {
  const container = getContentEditableContainer(editor);
  if (!container) {
    return null;
  }

  const selection = getWindowForNode(container).getSelection();
  if (selection && selection.rangeCount > 0) {
    const blockNode = findCompositionBlockNode(selection.anchorNode, container);
    if (blockNode) {
      return blockNode;
    }
  }

  const blockKey = editorState.getSelection().getAnchorKey();
  if (!blockKey) {
    return null;
  }
  const leaf = container.querySelector(`[data-offset-key^="${blockKey}-"]`);
  return findCompositionBlockNode(leaf, container);
}

function getCompositionDOMSelection(
  blockNode: HTMLElement,
): ?CompositionDOMSelection {
  const selection = getWindowForNode(blockNode).getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  if (!blockNode.contains(range.commonAncestorContainer)) {
    return null;
  }
  try {
    const startRange = range.cloneRange();
    startRange.selectNodeContents(blockNode);
    startRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = startRange.toString().length;

    const endRange = range.cloneRange();
    endRange.selectNodeContents(blockNode);
    endRange.setEnd(range.endContainer, range.endOffset);
    const endOffset = endRange.toString().length;

    return {startOffset, endOffset};
  } catch (_e) {
    return null;
  }
}

function getCompositionTextFromDOM(
  startText: string,
  endText: string,
  domSelection: ?CompositionDOMSelection,
): ?string {
  if (
    domSelection &&
    domSelection.startOffset >= 0 &&
    domSelection.startOffset <= domSelection.endOffset &&
    domSelection.endOffset <= startText.length
  ) {
    const startPrefix = startText.slice(0, domSelection.startOffset);
    const startSuffix = startText.slice(domSelection.endOffset);
    const composedLength = Math.max(
      0,
      endText.length - startPrefix.length - startSuffix.length,
    );
    const composedText = endText.slice(
      domSelection.startOffset,
      domSelection.startOffset + composedLength,
    );
    if (composedText && endText === startPrefix + composedText + startSuffix) {
      return composedText;
    }
  }

  if (endText.length < startText.length) {
    return null;
  }

  let prefixLength = 0;
  const maxPrefixLength = Math.min(startText.length, endText.length);
  while (
    prefixLength < maxPrefixLength &&
    startText[prefixLength] === endText[prefixLength]
  ) {
    prefixLength += 1;
  }

  let suffixLength = 0;
  while (
    suffixLength < startText.length - prefixLength &&
    suffixLength < endText.length - prefixLength &&
    startText[startText.length - 1 - suffixLength] ===
      endText[endText.length - 1 - suffixLength]
  ) {
    suffixLength += 1;
  }

  const composedText = endText.slice(
    prefixLength,
    endText.length - suffixLength,
  );
  if (!composedText) {
    return null;
  }

  const rebuiltText =
    startText.slice(0, prefixLength) +
    composedText +
    startText.slice(prefixLength);
  return rebuiltText === endText ? composedText : null;
}

function captureCompositionSnapshot(editor: DraftEditor): ?CompositionSnapshot {
  const editorState = editor._latestEditorState;
  if (!editorState) {
    return null;
  }
  const blockKey = editorState.getSelection().getAnchorKey();
  if (!blockKey) {
    return null;
  }
  const blockNode = getCompositionBlockNode(editor, editorState);
  return {
    editor,
    editorState,
    blockNode,
    blockText: blockNode ? blockNode.textContent : null,
    domSelection: blockNode ? getCompositionDOMSelection(blockNode) : null,
    composedText: null,
  };
}

function getComposedText(snapshot: CompositionSnapshot): ?string {
  const {blockNode, blockText, domSelection} = snapshot;
  if (blockNode && typeof blockText === 'string') {
    const endText = blockNode.textContent || '';
    const composedText =
      getCompositionTextFromDOM(blockText, endText, domSelection) ||
      getCompositionTextFromDOM(blockText, endText);
    if (composedText != null && composedText !== '') {
      return composedText;
    }
  }

  if (snapshot.composedText != null && snapshot.composedText !== '') {
    return snapshot.composedText;
  }

  return null;
}

function buildRepairedEditorState(
  snapshot: CompositionSnapshot,
  composedText: string,
): ?EditorStateType {
  if (!composedText) {
    return null;
  }

  const prevEditorState = snapshot.editorState;
  const prevSelection = prevEditorState.getSelection();
  const prevContent = prevEditorState.getCurrentContent();
  const anchorKey = prevSelection.getAnchorKey();
  if (!anchorKey || prevSelection.getStartKey() !== prevSelection.getEndKey()) {
    return null;
  }
  if (!prevContent.getBlockForKey(anchorKey)) {
    return null;
  }

  const entityKey = getEntityKeyForSelection(prevContent, prevSelection);
  const currentStyle = prevEditorState.getCurrentInlineStyle();
  const contentWithText = prevSelection.isCollapsed()
    ? DraftModifier.insertText(
        prevContent,
        prevSelection,
        composedText,
        currentStyle,
        entityKey,
      )
    : DraftModifier.replaceText(
        prevContent,
        prevSelection,
        composedText,
        currentStyle,
        entityKey,
      );

  const newOffset = prevSelection.getStartOffset() + composedText.length;
  const newSelection = prevSelection.merge({
    anchorOffset: newOffset,
    focusOffset: newOffset,
    isBackward: false,
  });
  const pushed = EditorState.push(
    prevEditorState,
    contentWithText,
    'insert-characters',
  );
  const outOfComposition = EditorState.set(pushed, {
    inCompositionMode: false,
    nativelyRenderedContent: null,
  });
  return EditorState.forceSelection(outOfComposition, newSelection);
}

const DraftEditorCompositionHandler = {
  /**
   * A `compositionstart` event has fired while we're still in composition
   * mode. Continue the current composition session to prevent a re-render.
   */
  onCompositionStart(editor: DraftEditor): void {
    // A previous composition may still be pending inside the 20ms resolve
    // window when the next composition starts (Korean/Japanese IMEs can
    // commit and immediately begin a new session, e.g. when switching input
    // modes or typing fast). If we simply overwrite the snapshot here, the
    // old DOM observer keeps accumulating mutations while the new snapshot
    // is captured, so the next resolveComposition rebuilds the state from a
    // snapshot that does not match the mutations it applies. Settle the
    // previous session first so each snapshot corresponds to one
    // composition.
    if (compositionSnapshot != null && !resolved) {
      DraftEditorCompositionHandler.resolveComposition(editor, true);
    }
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
  onCompositionEnd(editor: DraftEditor, e: ?SyntheticCompositionEvent<>): void {
    resolved = false;
    stillComposing = false;
    if (compositionSnapshot && e && e.data) {
      compositionSnapshot.composedText = e.data;
    }
    if (resolveTimer != null) {
      clearTimeout(resolveTimer);
    }
    resolveTimer = setTimeout(() => {
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
  onKeyDown(editor: DraftEditor, e: SyntheticKeyboardEvent<>): void {
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
  onKeyPress(_editor: DraftEditor, e: SyntheticKeyboardEvent<>): void {
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
  resolveComposition(
    editor: DraftEditor,
    continueComposition: ?boolean,
  ): void {
    if (stillComposing) {
      return;
    }

    const lastEditorState = editor._latestEditorState;
    const mutations = nullthrows(domObserver).stopAndFlushMutations();
    domObserver = null;
    resolved = true;
    if (resolveTimer != null) {
      clearTimeout(resolveTimer);
      resolveTimer = null;
    }

    let editorState = EditorState.set(lastEditorState, {
      inCompositionMode: continueComposition === true,
    });

    if (continueComposition !== true) {
      editor.exitCurrentMode();
    }

    if (!mutations.size) {
      compositionSnapshot = null;
      editor.update(editorState);
      return;
    }

    // TODO, check if Facebook still needs this flag or if it could be removed.
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

    let contentState = editorState.getCurrentContent();
    mutations.forEach((composedChars, offsetKey) => {
      const {blockKey, decoratorKey, leafKey} = DraftOffsetKey.decode(
        offsetKey,
      );

      const {start, end} = editorState
        .getBlockTree(blockKey)
        .getIn([decoratorKey, 'leaves', leafKey]);

      const replacementRange = editorState.getSelection().merge({
        anchorKey: blockKey,
        focusKey: blockKey,
        anchorOffset: start,
        focusOffset: end,
        isBackward: false,
      });

      const entityKey = getEntityKeyForSelection(
        contentState,
        replacementRange,
      );
      const currentStyle = contentState
        .getBlockForKey(blockKey)
        .getInlineStyleAt(start);

      contentState = DraftModifier.replaceText(
        contentState,
        replacementRange,
        composedChars,
        currentStyle,
        entityKey,
      );
      // We need to update the editorState so the leaf node ranges are properly
      // updated and multiple mutations are correctly applied.
      editorState = EditorState.set(editorState, {
        currentContent: contentState,
      });
    });

    const snapshot = compositionSnapshot;
    compositionSnapshot = null;

    if (snapshot) {
      const composedText = getComposedText(snapshot);
      if (composedText != null && composedText !== '') {
        let repairedEditorState = buildRepairedEditorState(
          snapshot,
          composedText,
        );
        if (repairedEditorState && continueComposition === true) {
          repairedEditorState = EditorState.set(repairedEditorState, {
            inCompositionMode: true,
          });
        }
        if (
          repairedEditorState &&
          !repairedEditorState
            .getCurrentContent()
            .getBlockMap()
            .equals(contentState.getBlockMap())
        ) {
          // The browser sometimes commits composed text as a new text node
          // whose nearest offset key is not the leaf containing the caret.
          // Rebuild from the pre-composition snapshot instead of applying the
          // misattributed mutation result.
          editor.restoreEditorDOM();
          editor.update(repairedEditorState);
          return;
        }
      }
    }

    // When we apply the text changes to the ContentState, the selection always
    // goes to the end of the field, but it should just stay where it is
    // after compositionEnd. We also apply this to the last editor state, rather
    // than the new editor state in order to avoid problems that might come from
    // race conditions around calculating ranges from mutations when processing
    // the mutations above. If the ranges are off, for example, using mentions
    // in IME mode, then the selection will move the cursor to an invalid range.
    // See D23905960 for more context:
    const documentSelection = getDraftEditorSelection(
      lastEditorState,
      getContentEditableContainer(editor),
    );
    const compositionEndSelectionState = documentSelection.selectionState;

    editor.restoreEditorDOM();

    // See:
    // - https://github.com/facebook/draft-js/issues/2093
    // - https://github.com/facebook/draft-js/pull/2094
    // Apply this fix only in IE for now. We can test it in
    // other browsers in the future to ensure no regressions
    const editorStateWithUpdatedSelection = isIE
      ? EditorState.forceSelection(editorState, compositionEndSelectionState)
      : EditorState.acceptSelection(editorState, compositionEndSelectionState);

    editor.update(
      EditorState.push(
        editorStateWithUpdatedSelection,
        contentState,
        'insert-characters',
      ),
    );
  },
};

module.exports = DraftEditorCompositionHandler;
