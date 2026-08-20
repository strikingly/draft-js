/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

// Korean IMEs commit via Space/arrow keys and can fire a new compositionstart
// before the previous 20ms resolve window expires. These tests drive a real
// DOMObserver against a contentEditable node and use a faithful selection
// reader (like a real browser) so the committed text is verified to survive
// both commit paths.
jest.useFakeTimers();

const ContentState = require('ContentState');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const SelectionState = require('SelectionState');

jest.unmock('DOMObserver');
jest.mock('getContentEditableContainer');
// Faithful selection reader: compute Draft offsets from the real DOM caret,
// mirroring what getDraftEditorSelectionWithNodes does for a single leaf.
jest.mock('getDraftEditorSelection', () => {
  return jest.fn((editorState, root) => {
    const selection = root.ownerDocument.defaultView.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return {selectionState: editorState.getSelection(), needsRecovery: false};
    }
    const range = selection.getRangeAt(0);
    const blockOffsetFrom = (node, offset) => {
      let el = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
      while (el && el.getAttribute('data-block') !== 'true') {
        el = el.parentNode;
      }
      if (!el) {
        return null;
      }
      const caret = document.createRange();
      caret.selectNodeContents(el);
      caret.setEnd(node, offset);
      return {
        anchorKey: editorState.getSelection().getAnchorKey(),
        offset: caret.toString().length,
      };
    };
    const startPoint = blockOffsetFrom(range.startContainer, range.startOffset);
    if (!startPoint) {
      return {selectionState: editorState.getSelection(), needsRecovery: false};
    }
    return {
      selectionState: editorState.getSelection().merge({
        anchorKey: startPoint.anchorKey,
        focusKey: startPoint.anchorKey,
        anchorOffset: startPoint.offset,
        focusOffset: startPoint.offset,
      }),
      needsRecovery: false,
    };
  });
});

let compositionHandler;
let editor;

function getLinkEditorState() {
  let content = ContentState.createFromText('你好链接');
  const blockKey = content.getFirstBlock().getKey();
  content = content.createEntity('LINK', 'MUTABLE', {
    url: 'https://example.com',
  });
  const entityKey = content.getLastCreatedEntityKey();
  content = DraftModifier.applyEntity(
    content,
    SelectionState.createEmpty(blockKey).merge({
      anchorOffset: 2,
      focusOffset: 4,
    }),
    entityKey,
  );
  const editorState = EditorState.createWithContent(content);
  const caret = SelectionState.createEmpty(blockKey).merge({
    anchorOffset: 4,
    focusOffset: 4,
  });
  return {
    editorState: EditorState.forceSelection(editorState, caret),
    blockKey,
    entityKey,
  };
}

function buildDOM(blockKey, text) {
  const container = document.createElement('div');
  const blockNode = document.createElement('div');
  blockNode.setAttribute('data-block', 'true');
  const leaf = document.createElement('span');
  leaf.setAttribute('data-offset-key', `${blockKey}-0-0`);
  const textNode = document.createTextNode(text);
  leaf.appendChild(textNode);
  blockNode.appendChild(leaf);
  container.appendChild(blockNode);
  return {container, blockNode, textNode};
}

function placeCaret(textNode) {
  const range = document.createRange();
  range.setStart(textNode, textNode.nodeValue.length);
  range.collapse(true);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function assertCommittedText(expectedText, blockKey, entityKey) {
  const contentState = editor._latestEditorState.getCurrentContent();
  const block = contentState.getBlockForKey(blockKey);
  expect(block.getText()).toBe(expectedText);
  expect(block.getEntityAt(2)).toBe(entityKey);
  expect(block.getEntityAt(3)).toBe(entityKey);
  expect(block.getEntityAt(4)).toBe(null);
  expect(block.getEntityAt(5)).toBe(null);
}

beforeEach(() => {
  jest.resetModules();
  compositionHandler = require('DraftEditorCompositionHandler');
  editor = {
    _latestEditorState: EditorState.createEmpty(),
    _onCompositionStart: () => compositionHandler.onCompositionStart(editor),
    _onKeyDown: jest.fn(),
    setMode: jest.fn(),
    restoreEditorDOM: jest.fn(),
    exitCurrentMode: jest.fn(),
    update: jest.fn(state => (editor._latestEditorState = state)),
  };
});

test('Korean composition committed via Space keeps all composed text when the next composition starts before resolve', () => {
  const {editorState, blockKey, entityKey} = getLinkEditorState();
  editor._latestEditorState = editorState;
  const {container, textNode} = buildDOM(blockKey, '你好链接');
  require('getContentEditableContainer').mockReturnValue(container);
  placeCaret(textNode);

  // Type 한 and commit with Space; the next session starts inside the 20ms
  // resolve window.
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한';
  placeCaret(textNode);
  compositionHandler.onCompositionEnd(editor, {});
  compositionHandler.onCompositionStart(editor);
  expect(editor.exitCurrentMode).not.toHaveBeenCalled();

  // Type 글 and commit.
  textNode.nodeValue = '你好链接한글';
  placeCaret(textNode);
  compositionHandler.onCompositionEnd(editor, {});
  jest.runAllTimers();

  assertCommittedText('你好链接한글', blockKey, entityKey);
  expect(editor.exitCurrentMode).toHaveBeenCalledTimes(1);
});

test('Korean composition committed after the resolve timer still keeps all composed text', () => {
  const {editorState, blockKey, entityKey} = getLinkEditorState();
  editor._latestEditorState = editorState;
  const {container, textNode} = buildDOM(blockKey, '你好链接');
  require('getContentEditableContainer').mockReturnValue(container);
  placeCaret(textNode);

  // The first composition resolves normally after the 20ms window.
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한';
  placeCaret(textNode);
  compositionHandler.onCompositionEnd(editor, {});
  jest.runAllTimers();

  // The second composition starts after the previous resolve completed.
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한글';
  placeCaret(textNode);
  compositionHandler.onCompositionEnd(editor, {});
  jest.runAllTimers();

  assertCommittedText('你好链接한글', blockKey, entityKey);
});

test('Korean composition committed via arrow keys keeps all composed text', () => {
  const {editorState, blockKey, entityKey} = getLinkEditorState();
  editor._latestEditorState = editorState;
  const {container, textNode} = buildDOM(blockKey, '你好链接');
  require('getContentEditableContainer').mockReturnValue(container);
  placeCaret(textNode);

  // Type 한, then commit by pressing the right arrow.
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한';
  placeCaret(textNode);
  compositionHandler.onCompositionEnd(editor, {});
  compositionHandler.onKeyDown(editor, {
    which: 39,
    preventDefault: jest.fn(),
  });

  // Type 글, then commit by pressing the left arrow.
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한글';
  placeCaret(textNode);
  compositionHandler.onCompositionEnd(editor, {});
  compositionHandler.onKeyDown(editor, {
    which: 37,
    preventDefault: jest.fn(),
  });
  jest.runAllTimers();

  assertCommittedText('你好链接한글', blockKey, entityKey);
});

test('Keeps all composed text when compositionstart repeats without an intervening compositionend', () => {
  const {editorState, blockKey, entityKey} = getLinkEditorState();
  editor._latestEditorState = editorState;
  const {container, textNode} = buildDOM(blockKey, '你好链接');
  require('getContentEditableContainer').mockReturnValue(container);
  placeCaret(textNode);

  // Some IMEs fire a second compositionstart while the first session is
  // still composing. The snapshot must not be overwritten, otherwise the
  // DOM diff only covers the second session and drops the first.
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한';
  placeCaret(textNode);
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한글';
  placeCaret(textNode);
  compositionHandler.onCompositionEnd(editor, {});
  jest.runAllTimers();

  assertCommittedText('你好链接한글', blockKey, entityKey);
  expect(editor.exitCurrentMode).toHaveBeenCalledTimes(1);
});
