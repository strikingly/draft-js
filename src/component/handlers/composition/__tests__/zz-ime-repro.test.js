/**
 * Temporary real-DOM repro for Korean Space/arrow commit (not part of suite).
 */
'use strict';
jest.useFakeTimers();
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const SelectionState = require('SelectionState');
jest.unmock('DOMObserver');
jest.mock('getContentEditableContainer');
jest.mock('getDraftEditorSelection', () => ({
  selectionState: SelectionState.createEmpty('anchor-key'),
}));
let compositionHandler;
let editor;
function getLinkEditorState() {
  let content = ContentState.createFromText('你好链接');
  const blockKey = content.getFirstBlock().getKey();
  content = content.createEntity('LINK', 'MUTABLE', {url: 'https://example.com'});
  const entityKey = content.getLastCreatedEntityKey();
  content = DraftModifier.applyEntity(content, SelectionState.createEmpty(blockKey).merge({anchorOffset: 2, focusOffset: 4}), entityKey);
  const editorState = EditorState.createWithContent(content);
  const caret = SelectionState.createEmpty(blockKey).merge({anchorOffset: 4, focusOffset: 4});
  return {editorState: EditorState.forceSelection(editorState, caret), blockKey, entityKey};
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
  const range = document.createRange();
  range.setStart(textNode, text.length);
  range.collapse(true);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  return {container, blockNode, leaf, textNode};
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
function assertLog(log, expectedFinal) {
  console.log('EVENT LOG:\n' + log.map(x => x.join(' => ')).join('\n'));
  expect(editor._latestEditorState.getCurrentContent().getPlainText()).toBe(expectedFinal);
}

test('Korean Space commit, second start before resolve: DISCARD pending keeps all committed chars', () => {
  const {editorState, blockKey} = getLinkEditorState();
  editor._latestEditorState = editorState;
  const {container, textNode} = buildDOM(blockKey, '你好链接');
  require('getContentEditableContainer').mockReturnValue(container);
  const log = [];
  // Type 한 (first composition)
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한';
  log.push(['after first start, text', editor._latestEditorState.getCurrentContent().getPlainText()]);
  // Commit (Space/arrow) -> immediately new composition starts before timer
  compositionHandler.onCompositionEnd(editor, {});
  compositionHandler.onCompositionStart(editor);
  log.push(['after second start, text', editor._latestEditorState.getCurrentContent().getPlainText()]);
  // Type 글 (second composition) and commit
  textNode.nodeValue = '你好链接한글';
  compositionHandler.onCompositionEnd(editor, {});
  log.push(['before timers, text', editor._latestEditorState.getCurrentContent().getPlainText()]);
  jest.runAllTimers();
  log.push(['final text', editor._latestEditorState.getCurrentContent().getPlainText()]);
  assertLog(log, '你好链接한글');
});

test('Korean Space commit, second start after resolve timer: normal path still works', () => {
  const {editorState, blockKey} = getLinkEditorState();
  editor._latestEditorState = editorState;
  const {container, textNode} = buildDOM(blockKey, '你好链接');
  require('getContentEditableContainer').mockReturnValue(container);
  const log = [];
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한';
  compositionHandler.onCompositionEnd(editor, {});
  jest.runAllTimers();
  log.push(['after first resolve, text', editor._latestEditorState.getCurrentContent().getPlainText()]);
  // New composition after resolve completed
  compositionHandler.onCompositionStart(editor);
  textNode.nodeValue = '你好链接한글';
  compositionHandler.onCompositionEnd(editor, {});
  jest.runAllTimers();
  log.push(['final text', editor._latestEditorState.getCurrentContent().getPlainText()]);
  assertLog(log, '你好链接한글');
});
