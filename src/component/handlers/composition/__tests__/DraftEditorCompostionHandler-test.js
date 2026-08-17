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

// DraftEditorComposition uses timers to detect duplicate `compositionend`
// events.
jest.useFakeTimers();

const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const SelectionState = require('SelectionState');

const convertFromHTMLToContentBlocks = require('convertFromHTMLToContentBlocks');
const editOnCompositionStart = require('editOnCompositionStart');
const {Map} = require('immutable');

jest.mock('DOMObserver', () => {
  function DOMObserver() {}
  DOMObserver.prototype.start = jest.fn();
  DOMObserver.prototype.stopAndFlushMutations = jest
    .fn()
    .mockReturnValue(Map({}));
  return DOMObserver;
});
jest.mock('getContentEditableContainer');
jest.mock('getDraftEditorSelection', () => {
  return jest.fn().mockReturnValue({
    selectionState: SelectionState.createEmpty('anchor-key'),
  });
});

// The DraftEditorCompositionHandler contains some global state
// (internally used to make the code simpler given that only one
// composition can be happening at a given time), so to avoid
// false-positive failures stemming from test cases putting
// the module in a bad state we forcibly reload it each test.
let compositionHandler = null;
// Initialization of mock editor component that will be used for all tests
let editor;

function getEditorState(blocks) {
  const contentBlocks = Object.keys(blocks).map(blockKey => {
    return new ContentBlock({
      key: blockKey,
      text: blocks[String(blockKey)],
    });
  });
  return EditorState.createWithContent(
    ContentState.createFromBlockArray(contentBlocks),
  );
}

function getEditorStateFromHTML(html: string) {
  const blocksFromHTML = convertFromHTMLToContentBlocks(html);
  const state =
    blocksFromHTML != null
      ? ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks || [],
          blocksFromHTML.entityMap,
        )
      : ContentState.createFromText('');
  return EditorState.createWithContent(state);
}

function editorTextContent() {
  return editor._latestEditorState.getCurrentContent().getPlainText();
}

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

function getCompositionContainer(blockKey: string) {
  const container = document.createElement('div');
  const blockNode = document.createElement('div');
  blockNode.setAttribute('data-block', 'true');
  blockNode.setAttribute('data-offset-key', `${blockKey}-0-0`);
  blockNode.textContent = '你好链接';
  container.appendChild(blockNode);
  return {container, blockNode};
}

function withGlobalGetSelectionAs(getSelectionValue, callback) {
  const oldGetSelection = global.getSelection;
  try {
    global.getSelection = () => getSelectionValue;
    callback();
  } finally {
    global.getSelection = oldGetSelection;
  }
}

beforeEach(() => {
  jest.resetModules();
  compositionHandler = require('DraftEditorCompositionHandler');
  editor = {
    _latestEditorState: EditorState.createEmpty(),
    _onCompositionStart: compositionHandler.onCompositionStart,
    _onKeyDown: jest.fn(),
    setMode: jest.fn(),
    restoreEditorDOM: jest.fn(),
    exitCurrentMode: jest.fn(),
    update: jest.fn(state => (editor._latestEditorState = state)),
  };
});

afterEach(() => {
  require('getContentEditableContainer').mockReset();
});

test('isInCompositionMode is properly updated on composition events', () => {
  // `inCompositionMode` is updated inside editOnCompositionStart,
  // which is why we can't just call compositionHandler.onCompositionStart.
  // $FlowExpectedError[incompatible-call]
  editOnCompositionStart(editor, {});
  expect(editor.setMode).toHaveBeenLastCalledWith('composite');
  expect(editor._latestEditorState.isInCompositionMode()).toBe(true);
  // $FlowExpectedError[incompatible-use]
  // $FlowExpectedError[incompatible-call]
  compositionHandler.onCompositionEnd(editor);
  jest.runAllTimers();
  expect(editor._latestEditorState.isInCompositionMode()).toBe(false);
  expect(editor.exitCurrentMode).toHaveBeenCalled();
});

test('Can handle a single mutation', () => {
  withGlobalGetSelectionAs({}, () => {
    editor._latestEditorState = getEditorState({blockkey0: ''});
    const mutations = Map({'blockkey0-0-0': '\u79c1'});
    require('DOMObserver').prototype.stopAndFlushMutations.mockReturnValue(
      mutations,
    );
    // $FlowExpectedError[incompatible-use]
    // $FlowExpectedError[incompatible-call]
    compositionHandler.onCompositionStart(editor);
    // $FlowExpectedError[incompatible-use]
    // $FlowExpectedError[incompatible-call]
    compositionHandler.onCompositionEnd(editor);
    jest.runAllTimers();

    expect(editorTextContent()).toBe('\u79c1');
  });
});

test('Can handle mutations in multiple blocks', () => {
  withGlobalGetSelectionAs({}, () => {
    editor._latestEditorState = getEditorState({
      blockkey0: 'react',
      blockkey1: 'draft',
    });
    const mutations = Map({
      'blockkey0-0-0': 'reactjs',
      'blockkey1-0-0': 'draftjs',
    });
    require('DOMObserver').prototype.stopAndFlushMutations.mockReturnValue(
      mutations,
    );
    // $FlowExpectedError[incompatible-use]
    // $FlowExpectedError[incompatible-call]
    compositionHandler.onCompositionStart(editor);
    // $FlowExpectedError[incompatible-use]
    // $FlowExpectedError[incompatible-call]
    compositionHandler.onCompositionEnd(editor);
    jest.runAllTimers();

    expect(editorTextContent()).toBe('reactjs\ndraftjs');
  });
});

test('Can handle mutations in the same block in multiple leaf nodes', () => {
  withGlobalGetSelectionAs({}, () => {
    const editorState = (editor._latestEditorState = getEditorStateFromHTML(
      '<div>react <b>draft</b> graphql</div>',
    ));
    const blockKey = editorState
      .getCurrentContent()
      .getBlockMap()
      .first()
      .getKey();
    const mutations = Map({
      [`${blockKey}-0-0`]: 'reacta ',
      [`${blockKey}-0-1`]: 'draftbb',
      [`${blockKey}-0-2`]: ' graphqlccc',
    });
    require('DOMObserver').prototype.stopAndFlushMutations.mockReturnValue(
      mutations,
    );
    // $FlowExpectedError[incompatible-use]
    // $FlowExpectedError[incompatible-call]
    compositionHandler.onCompositionStart(editor);
    // $FlowExpectedError[incompatible-use]
    // $FlowExpectedError[incompatible-call]
    compositionHandler.onCompositionEnd(editor);
    jest.runAllTimers();

    expect(editorTextContent()).toBe('reacta draftbb graphqlccc');
  });
});

test('Repairs composed text committed after a LINK entity', () => {
  const {editorState, blockKey, entityKey} = getLinkEditorState();
  editor._latestEditorState = editorState;

  const {container, blockNode} = getCompositionContainer(blockKey);
  require('getContentEditableContainer').mockReturnValue(container);
  const mutations = Map({[`${blockKey}-0-0`]: '你好链接中文'});
  require('DOMObserver').prototype.stopAndFlushMutations.mockReturnValue(
    mutations,
  );

  // $FlowExpectedError[incompatible-use]
  // $FlowExpectedError[incompatible-call]
  compositionHandler.onCompositionStart(editor);
  blockNode.textContent = '你好链接中文';
  // $FlowExpectedError[incompatible-use]
  // $FlowExpectedError[incompatible-call]
  compositionHandler.onCompositionEnd(editor, {data: '中文'});
  jest.runAllTimers();

  const contentState = editor._latestEditorState.getCurrentContent();
  const block = contentState.getBlockForKey(blockKey);
  expect(block.getText()).toBe('你好链接中文');
  expect(block.getEntityAt(2)).toBe(entityKey);
  expect(block.getEntityAt(3)).toBe(entityKey);
  expect(block.getEntityAt(4)).toBe(null);
});

test('Repairs composed text without compositionend data', () => {
  const {editorState, blockKey, entityKey} = getLinkEditorState();
  editor._latestEditorState = editorState;

  const {container, blockNode} = getCompositionContainer(blockKey);
  require('getContentEditableContainer').mockReturnValue(container);
  const mutations = Map({[`${blockKey}-0-0`]: '你好链接中文'});
  require('DOMObserver').prototype.stopAndFlushMutations.mockReturnValue(
    mutations,
  );

  // $FlowExpectedError[incompatible-use]
  // $FlowExpectedError[incompatible-call]
  compositionHandler.onCompositionStart(editor);
  blockNode.textContent = '你好链接中文';
  // $FlowExpectedError[incompatible-use]
  // $FlowExpectedError[incompatible-call]
  compositionHandler.onCompositionEnd(editor);
  jest.runAllTimers();

  const contentState = editor._latestEditorState.getCurrentContent();
  const block = contentState.getBlockForKey(blockKey);
  expect(block.getText()).toBe('你好链接中文');
  expect(block.getEntityAt(2)).toBe(entityKey);
  expect(block.getEntityAt(3)).toBe(entityKey);
  expect(block.getEntityAt(4)).toBe(null);
});

test('Repairs composed text using the caret-anchored DOM diff', () => {
  const {editorState, blockKey, entityKey} = getLinkEditorState();
  editor._latestEditorState = editorState;

  const {container, blockNode} = getCompositionContainer(blockKey);
  require('getContentEditableContainer').mockReturnValue(container);
  const mutations = Map({[`${blockKey}-0-0`]: '你好链接中文'});
  require('DOMObserver').prototype.stopAndFlushMutations.mockReturnValue(
    mutations,
  );

  const textNode = blockNode.firstChild;
  if (!textNode) {
    throw new Error('Expected a text node in the composition block');
  }
  const range = blockNode.ownerDocument.createRange();
  range.setStart(textNode, 4);
  range.collapse(true);
  const window = blockNode.ownerDocument.defaultView;
  const selection = window && window.getSelection();
  if (!selection) {
    throw new Error('Expected a native selection');
  }
  selection.removeAllRanges();
  selection.addRange(range);

  // $FlowExpectedError[incompatible-use]
  // $FlowExpectedError[incompatible-call]
  compositionHandler.onCompositionStart(editor);
  blockNode.textContent = '你好链接中文';
  // $FlowExpectedError[incompatible-use]
  // $FlowExpectedError[incompatible-call]
  compositionHandler.onCompositionEnd(editor);
  jest.runAllTimers();

  const contentState = editor._latestEditorState.getCurrentContent();
  const block = contentState.getBlockForKey(blockKey);
  expect(block.getText()).toBe('你好链接中文');
  expect(block.getEntityAt(2)).toBe(entityKey);
  expect(block.getEntityAt(3)).toBe(entityKey);
  expect(block.getEntityAt(4)).toBe(null);
});
