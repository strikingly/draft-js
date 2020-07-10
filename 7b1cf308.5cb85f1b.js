/*! For license information please see 7b1cf308.5cb85f1b.js.LICENSE.txt */
(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{156:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return a})),n.d(t,"metadata",(function(){return i})),n.d(t,"rightToc",(function(){return l})),n.d(t,"default",(function(){return b}));var r=n(2),o=n(9),c=(n(181),n(180)),a={id:"api-reference-selection-state",title:"SelectionState"},i={id:"api-reference-selection-state",title:"SelectionState",description:"SelectionState is an Immutable Record that represents a selection range in the editor.",source:"@site/../docs/APIReference-SelectionState.md",permalink:"/docs/api-reference-selection-state",editUrl:"https://github.com/facebook/draft-js/edit/master/docs/../docs/APIReference-SelectionState.md",lastUpdatedBy:"Kevin Chavez",lastUpdatedAt:1585041753,sidebar:"docs",previous:{title:"Entity",permalink:"/docs/api-reference-entity"},next:{title:"CompositeDecorator",permalink:"/docs/api-reference-composite-decorator"}},l=[{value:"Keys and Offsets",id:"keys-and-offsets",children:[]},{value:"Start/End vs. Anchor/Focus",id:"startend-vs-anchorfocus",children:[]},{value:"Overview",id:"overview",children:[]},{value:"Static Methods",id:"static-methods",children:[{value:"<code>createEmpty()</code>",id:"createempty",children:[]}]},{value:"Methods",id:"methods",children:[{value:"<code>getStartKey()</code>",id:"getstartkey",children:[]},{value:"<code>getStartOffset()</code>",id:"getstartoffset",children:[]},{value:"<code>getEndKey()</code>",id:"getendkey",children:[]},{value:"<code>getEndOffset()</code>",id:"getendoffset",children:[]},{value:"<code>getAnchorKey()</code>",id:"getanchorkey",children:[]},{value:"<code>getAnchorOffset()</code>",id:"getanchoroffset",children:[]},{value:"<code>getFocusKey()</code>",id:"getfocuskey",children:[]},{value:"<code>getFocusOffset()</code>",id:"getfocusoffset",children:[]},{value:"<code>getIsBackward()</code>",id:"getisbackward",children:[]},{value:"<code>getHasFocus()</code>",id:"gethasfocus",children:[]},{value:"<code>isCollapsed()</code>",id:"iscollapsed",children:[]},{value:"<code>hasEdgeWithin()</code>",id:"hasedgewithin",children:[]},{value:"<code>serialize()</code>",id:"serialize",children:[]}]},{value:"Properties",id:"properties",children:[{value:"<code>anchorKey</code>",id:"anchorkey",children:[]},{value:"<code>anchorOffset</code>",id:"anchoroffset",children:[]},{value:"<code>focusKey</code>",id:"focuskey",children:[]},{value:"<code>focusOffset</code>",id:"focusoffset",children:[]},{value:"<code>isBackward</code>",id:"isbackward",children:[]},{value:"<code>hasFocus</code>",id:"hasfocus",children:[]}]}],s={rightToc:l};function b(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(c.b)("wrapper",Object(r.a)({},s,n,{components:t,mdxType:"MDXLayout"}),Object(c.b)("p",null,Object(c.b)("inlineCode",{parentName:"p"},"SelectionState")," is an Immutable ",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"http://facebook.github.io/immutable-js/docs/#/Record/Record"}),"Record")," that represents a selection range in the editor."),Object(c.b)("p",null,"The most common use for the ",Object(c.b)("inlineCode",{parentName:"p"},"SelectionState")," object is via ",Object(c.b)("inlineCode",{parentName:"p"},"EditorState.getSelection()"),",\nwhich provides the ",Object(c.b)("inlineCode",{parentName:"p"},"SelectionState")," currently being rendered in the editor."),Object(c.b)("h3",{id:"keys-and-offsets"},"Keys and Offsets"),Object(c.b)("p",null,"A selection range has two points: an ",Object(c.b)("strong",{parentName:"p"},"anchor")," and a ",Object(c.b)("strong",{parentName:"p"},"focus"),". (Read more on\n",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"https://developer.mozilla.org/en-US/docs/Web/API/Selection#Glossary"}),"MDN"),")."),Object(c.b)("p",null,"The native DOM approach represents each point as a Node/offset pair, where the offset\nis a number corresponding either to a position within a Node's ",Object(c.b)("inlineCode",{parentName:"p"},"childNodes")," or, if the\nNode is a text node, a character offset within the text contents."),Object(c.b)("p",null,"Since Draft maintains the contents of the editor using ",Object(c.b)("inlineCode",{parentName:"p"},"ContentBlock")," objects,\nwe can use our own model to represent these points. Thus, selection points are\ntracked as key/offset pairs, where the ",Object(c.b)("inlineCode",{parentName:"p"},"key")," value is the key of the ",Object(c.b)("inlineCode",{parentName:"p"},"ContentBlock"),"\nwhere the point is positioned and the ",Object(c.b)("inlineCode",{parentName:"p"},"offset")," value is the character offset\nwithin the block."),Object(c.b)("h3",{id:"startend-vs-anchorfocus"},"Start/End vs. Anchor/Focus"),Object(c.b)("p",null,"The concept of ",Object(c.b)("strong",{parentName:"p"},"anchor")," and ",Object(c.b)("strong",{parentName:"p"},"focus")," is very useful when actually rendering\na selection state in the browser, as it allows us to use forward and backward\nselection as needed. For editing operations, however, the direction of the selection\ndoesn't matter. In this case, it is more appropriate to think in terms of\n",Object(c.b)("strong",{parentName:"p"},"start")," and ",Object(c.b)("strong",{parentName:"p"},"end")," points."),Object(c.b)("p",null,"The ",Object(c.b)("inlineCode",{parentName:"p"},"SelectionState")," therefore exposes both anchor/focus values and\nstart/end values. When managing selection behavior, we recommend that\nyou work with ",Object(c.b)("em",{parentName:"p"},"anchor")," and ",Object(c.b)("em",{parentName:"p"},"focus")," values to maintain selection direction.\nWhen managing content operations, however, we recommend that you use ",Object(c.b)("em",{parentName:"p"},"start"),"\nand ",Object(c.b)("em",{parentName:"p"},"end")," values."),Object(c.b)("p",null,"For instance, when extracting a slice of text from a block based on a\n",Object(c.b)("inlineCode",{parentName:"p"},"SelectionState"),", it is irrelevant whether the selection is backward:"),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"var selectionState = editorState.getSelection();\nvar anchorKey = selectionState.getAnchorKey();\nvar currentContent = editorState.getCurrentContent();\nvar currentContentBlock = currentContent.getBlockForKey(anchorKey);\nvar start = selectionState.getStartOffset();\nvar end = selectionState.getEndOffset();\nvar selectedText = currentContentBlock.getText().slice(start, end);\n")),Object(c.b)("p",null,"Note that ",Object(c.b)("inlineCode",{parentName:"p"},"SelectionState")," itself tracks only ",Object(c.b)("em",{parentName:"p"},"anchor")," and ",Object(c.b)("em",{parentName:"p"},"focus")," values.\n",Object(c.b)("em",{parentName:"p"},"Start")," and ",Object(c.b)("em",{parentName:"p"},"end")," values are derived."),Object(c.b)("h2",{id:"overview"},"Overview"),Object(c.b)("p",null,Object(c.b)("em",{parentName:"p"},"Static Methods")),Object(c.b)("ul",{class:"apiIndex"},Object(c.b)("li",null,Object(c.b)("a",{href:"#createempty"},Object(c.b)("pre",null,"static createEmpty(blockKey)")))),Object(c.b)("p",null,Object(c.b)("em",{parentName:"p"},"Methods")),Object(c.b)("ul",{class:"apiIndex"},Object(c.b)("li",null,Object(c.b)("a",{href:"#getstartkey"},Object(c.b)("pre",null,"getStartKey()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#getstartoffset"},Object(c.b)("pre",null,"getStartOffset()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#getendkey"},Object(c.b)("pre",null,"getEndKey()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#getendoffset"},Object(c.b)("pre",null,"getEndOffset()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#getanchorkey"},Object(c.b)("pre",null,"getAnchorKey()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#getanchoroffset"},Object(c.b)("pre",null,"getAnchorOffset()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#getfocuskey"},Object(c.b)("pre",null,"getFocusKey()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#getfocusoffset"},Object(c.b)("pre",null,"getFocusOffset()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#getisbackward"},Object(c.b)("pre",null,"getIsBackward()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#gethasfocus"},Object(c.b)("pre",null,"getHasFocus()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#iscollapsed"},Object(c.b)("pre",null,"isCollapsed()"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#hasedgewithin"},Object(c.b)("pre",null,"hasEdgeWithin(blockKey, start, end)"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#serialize"},Object(c.b)("pre",null,"serialize()")))),Object(c.b)("p",null,Object(c.b)("em",{parentName:"p"},"Properties")),Object(c.b)("blockquote",null,Object(c.b)("p",{parentName:"blockquote"},"Use ",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"http://facebook.github.io/immutable-js/docs/#/Record/Record"}),"Immutable Map API")," to\nset properties."),Object(c.b)("p",{parentName:"blockquote"},Object(c.b)("strong",{parentName:"p"},"Example")),Object(c.b)("pre",{parentName:"blockquote"},Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const selectionState = SelectionState.createEmpty();\nconst selectionStateWithNewFocusOffset = selection.set('focusOffset', 1);\n"))),Object(c.b)("ul",{class:"apiIndex"},Object(c.b)("li",null,Object(c.b)("a",{href:"#anchorkey"},Object(c.b)("pre",null,"anchorKey"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#anchoroffset"},Object(c.b)("pre",null,"anchorOffset"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#focuskey"},Object(c.b)("pre",null,"focusKey"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#focusoffset"},Object(c.b)("pre",null,"focusOffset"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#isbackward"},Object(c.b)("pre",null,"isBackward"))),Object(c.b)("li",null,Object(c.b)("a",{href:"#hasfocus"},Object(c.b)("pre",null,"hasFocus")))),Object(c.b)("h2",{id:"static-methods"},"Static Methods"),Object(c.b)("h3",{id:"createempty"},Object(c.b)("inlineCode",{parentName:"h3"},"createEmpty()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"createEmpty(blockKey: string): SelectionState\n")),Object(c.b)("p",null,"Create a ",Object(c.b)("inlineCode",{parentName:"p"},"SelectionState")," object at the zero offset of the provided block key\nand ",Object(c.b)("inlineCode",{parentName:"p"},"hasFocus")," set to false."),Object(c.b)("h2",{id:"methods"},"Methods"),Object(c.b)("h3",{id:"getstartkey"},Object(c.b)("inlineCode",{parentName:"h3"},"getStartKey()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getStartKey(): string\n")),Object(c.b)("p",null,"Returns the key of the block containing the start position of the selection range."),Object(c.b)("h3",{id:"getstartoffset"},Object(c.b)("inlineCode",{parentName:"h3"},"getStartOffset()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getStartOffset(): number\n")),Object(c.b)("p",null,"Returns the block-level character offset of the start position of the selection range."),Object(c.b)("h3",{id:"getendkey"},Object(c.b)("inlineCode",{parentName:"h3"},"getEndKey()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getEndKey(): string\n")),Object(c.b)("p",null,"Returns the key of the block containing the end position of the selection range."),Object(c.b)("h3",{id:"getendoffset"},Object(c.b)("inlineCode",{parentName:"h3"},"getEndOffset()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getEndOffset(): number\n")),Object(c.b)("p",null,"Returns the block-level character offset of the end position of the selection range."),Object(c.b)("h3",{id:"getanchorkey"},Object(c.b)("inlineCode",{parentName:"h3"},"getAnchorKey()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getAnchorKey(): string\n")),Object(c.b)("p",null,"Returns the key of the block containing the anchor position of the selection range."),Object(c.b)("h3",{id:"getanchoroffset"},Object(c.b)("inlineCode",{parentName:"h3"},"getAnchorOffset()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getAnchorOffset(): number\n")),Object(c.b)("p",null,"Returns the block-level character offset of the anchor position of the selection range."),Object(c.b)("h3",{id:"getfocuskey"},Object(c.b)("inlineCode",{parentName:"h3"},"getFocusKey()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getFocusKey(): string\n")),Object(c.b)("p",null,"Returns the key of the block containing the focus position of the selection range."),Object(c.b)("h3",{id:"getfocusoffset"},Object(c.b)("inlineCode",{parentName:"h3"},"getFocusOffset()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getFocusOffset(): number\n")),Object(c.b)("p",null,"Returns the block-level character offset of the focus position of the selection range."),Object(c.b)("h3",{id:"getisbackward"},Object(c.b)("inlineCode",{parentName:"h3"},"getIsBackward()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getIsBackward(): boolean\n")),Object(c.b)("p",null,"Returns whether the focus position is before the anchor position in the document."),Object(c.b)("p",null,"This must be derived from the key order of the active ",Object(c.b)("inlineCode",{parentName:"p"},"ContentState"),", or if the selection\nrange is entirely within one block, a comparison of the anchor and focus offset values."),Object(c.b)("h3",{id:"gethasfocus"},Object(c.b)("inlineCode",{parentName:"h3"},"getHasFocus()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"getHasFocus(): boolean\n")),Object(c.b)("p",null,"Returns whether the editor has focus."),Object(c.b)("h3",{id:"iscollapsed"},Object(c.b)("inlineCode",{parentName:"h3"},"isCollapsed()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"isCollapsed(): boolean\n")),Object(c.b)("p",null,"Returns whether the selection range is collapsed, i.e. a caret. This is true\nwhen the anchor and focus keys are the same /and/ the anchor and focus offsets\nare the same."),Object(c.b)("h3",{id:"hasedgewithin"},Object(c.b)("inlineCode",{parentName:"h3"},"hasEdgeWithin()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"hasEdgeWithin(blockKey: string, start: number, end: number): boolean\n")),Object(c.b)("p",null,"Returns whether the selection range has an edge that overlaps with the specified\nstart/end range within a given block."),Object(c.b)("p",null,"This is useful when setting DOM selection within a block after contents are\nrendered."),Object(c.b)("h3",{id:"serialize"},Object(c.b)("inlineCode",{parentName:"h3"},"serialize()")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"serialize(): string\n")),Object(c.b)("p",null,"Returns a serialized version of the ",Object(c.b)("inlineCode",{parentName:"p"},"SelectionState"),". Useful for debugging."),Object(c.b)("h2",{id:"properties"},"Properties"),Object(c.b)("blockquote",null,Object(c.b)("p",{parentName:"blockquote"},"Use ",Object(c.b)("a",Object(r.a)({parentName:"p"},{href:"http://facebook.github.io/immutable-js/docs/#/Record/Record"}),"Immutable Map API")," to\nset properties.")),Object(c.b)("pre",null,Object(c.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"var selectionState = SelectionState.createEmpty('foo');\nvar updatedSelection = selectionState.merge({\n  focusKey: 'bar',\n  focusOffset: 0,\n});\nvar anchorKey = updatedSelection.getAnchorKey(); // 'foo'\nvar focusKey = updatedSelection.getFocusKey(); // 'bar'\n")),Object(c.b)("h3",{id:"anchorkey"},Object(c.b)("inlineCode",{parentName:"h3"},"anchorKey")),Object(c.b)("p",null,"The block containing the anchor end of the selection range."),Object(c.b)("h3",{id:"anchoroffset"},Object(c.b)("inlineCode",{parentName:"h3"},"anchorOffset")),Object(c.b)("p",null,"The offset position of the anchor end of the selection range."),Object(c.b)("h3",{id:"focuskey"},Object(c.b)("inlineCode",{parentName:"h3"},"focusKey")),Object(c.b)("p",null,"The block containing the focus end of the selection range."),Object(c.b)("h3",{id:"focusoffset"},Object(c.b)("inlineCode",{parentName:"h3"},"focusOffset")),Object(c.b)("p",null,"The offset position of the focus end of the selection range."),Object(c.b)("h3",{id:"isbackward"},Object(c.b)("inlineCode",{parentName:"h3"},"isBackward")),Object(c.b)("p",null,"If the anchor position is lower in the document than the focus position, the selection is backward. Note: The ",Object(c.b)("inlineCode",{parentName:"p"},"SelectionState")," is an object with no knowledge of the ",Object(c.b)("inlineCode",{parentName:"p"},"ContentState")," structure. Therefore, when updating ",Object(c.b)("inlineCode",{parentName:"p"},"SelectionState")," values, you are responsible for updating ",Object(c.b)("inlineCode",{parentName:"p"},"isBackward")," as well."),Object(c.b)("h3",{id:"hasfocus"},Object(c.b)("inlineCode",{parentName:"h3"},"hasFocus")),Object(c.b)("p",null,"Whether the editor currently has focus."))}b.isMDXComponent=!0},180:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return d}));var r=n(0),o=n.n(r);function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){c(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},c=Object.keys(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=o.a.createContext({}),b=function(e){var t=o.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=b(e.components);return o.a.createElement(s.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},p=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,c=e.originalType,a=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),u=b(n),p=r,d=u["".concat(a,".").concat(p)]||u[p]||f[p]||c;return n?o.a.createElement(d,i(i({ref:t},s),{},{components:n})):o.a.createElement(d,i({ref:t},s))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var c=n.length,a=new Array(c);a[0]=p;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:r,a[1]=i;for(var s=2;s<c;s++)a[s]=n[s];return o.a.createElement.apply(null,a)}return o.a.createElement.apply(null,n)}p.displayName="MDXCreateElement"},181:function(e,t,n){"use strict";e.exports=n(182)},182:function(e,t,n){"use strict";var r=n(183),o="function"==typeof Symbol&&Symbol.for,c=o?Symbol.for("react.element"):60103,a=o?Symbol.for("react.portal"):60106,i=o?Symbol.for("react.fragment"):60107,l=o?Symbol.for("react.strict_mode"):60108,s=o?Symbol.for("react.profiler"):60114,b=o?Symbol.for("react.provider"):60109,u=o?Symbol.for("react.context"):60110,f=o?Symbol.for("react.concurrent_mode"):60111,p=o?Symbol.for("react.forward_ref"):60112,d=o?Symbol.for("react.suspense"):60113,h=o?Symbol.for("react.memo"):60115,O=o?Symbol.for("react.lazy"):60116,j="function"==typeof Symbol&&Symbol.iterator;function m(e,t,n,r,o,c,a,i){if(!e){if(e=void 0,void 0===t)e=Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var l=[n,r,o,c,a,i],s=0;(e=Error(t.replace(/%s/g,(function(){return l[s++]})))).name="Invariant Violation"}throw e.framesToPop=1,e}}function g(e){for(var t=arguments.length-1,n="https://reactjs.org/docs/error-decoder.html?invariant="+e,r=0;r<t;r++)n+="&args[]="+encodeURIComponent(arguments[r+1]);m(!1,"Minified React error #"+e+"; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",n)}var y={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},v={};function k(e,t,n){this.props=e,this.context=t,this.refs=v,this.updater=n||y}function N(){}function S(e,t,n){this.props=e,this.context=t,this.refs=v,this.updater=n||y}k.prototype.isReactComponent={},k.prototype.setState=function(e,t){"object"!=typeof e&&"function"!=typeof e&&null!=e&&g("85"),this.updater.enqueueSetState(this,e,t,"setState")},k.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")},N.prototype=k.prototype;var w=S.prototype=new N;w.constructor=S,r(w,k.prototype),w.isPureReactComponent=!0;var C={current:null},E={current:null},x=Object.prototype.hasOwnProperty,P={key:!0,ref:!0,__self:!0,__source:!0};function R(e,t,n){var r=void 0,o={},a=null,i=null;if(null!=t)for(r in void 0!==t.ref&&(i=t.ref),void 0!==t.key&&(a=""+t.key),t)x.call(t,r)&&!P.hasOwnProperty(r)&&(o[r]=t[r]);var l=arguments.length-2;if(1===l)o.children=n;else if(1<l){for(var s=Array(l),b=0;b<l;b++)s[b]=arguments[b+2];o.children=s}if(e&&e.defaultProps)for(r in l=e.defaultProps)void 0===o[r]&&(o[r]=l[r]);return{$$typeof:c,type:e,key:a,ref:i,props:o,_owner:E.current}}function K(e){return"object"==typeof e&&null!==e&&e.$$typeof===c}var _=/\/+/g,T=[];function F(e,t,n,r){if(T.length){var o=T.pop();return o.result=e,o.keyPrefix=t,o.func=n,o.context=r,o.count=0,o}return{result:e,keyPrefix:t,func:n,context:r,count:0}}function A(e){e.result=null,e.keyPrefix=null,e.func=null,e.context=null,e.count=0,10>T.length&&T.push(e)}function I(e,t,n){return null==e?0:function e(t,n,r,o){var i=typeof t;"undefined"!==i&&"boolean"!==i||(t=null);var l=!1;if(null===t)l=!0;else switch(i){case"string":case"number":l=!0;break;case"object":switch(t.$$typeof){case c:case a:l=!0}}if(l)return r(o,t,""===n?"."+$(t,0):n),1;if(l=0,n=""===n?".":n+":",Array.isArray(t))for(var s=0;s<t.length;s++){var b=n+$(i=t[s],s);l+=e(i,b,r,o)}else if(null===t||"object"!=typeof t?b=null:b="function"==typeof(b=j&&t[j]||t["@@iterator"])?b:null,"function"==typeof b)for(t=b.call(t),s=0;!(i=t.next()).done;)l+=e(i=i.value,b=n+$(i,s++),r,o);else"object"===i&&g("31","[object Object]"===(r=""+t)?"object with keys {"+Object.keys(t).join(", ")+"}":r,"");return l}(e,"",t,n)}function $(e,t){return"object"==typeof e&&null!==e&&null!=e.key?function(e){var t={"=":"=0",":":"=2"};return"$"+(""+e).replace(/[=:]/g,(function(e){return t[e]}))}(e.key):t.toString(36)}function M(e,t){e.func.call(e.context,t,e.count++)}function B(e,t,n){var r=e.result,o=e.keyPrefix;e=e.func.call(e.context,t,e.count++),Array.isArray(e)?D(e,r,n,(function(e){return e})):null!=e&&(K(e)&&(e=function(e,t){return{$$typeof:c,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}(e,o+(!e.key||t&&t.key===e.key?"":(""+e.key).replace(_,"$&/")+"/")+n)),r.push(e))}function D(e,t,n,r,o){var c="";null!=n&&(c=(""+n).replace(_,"$&/")+"/"),I(e,B,t=F(t,c,r,o)),A(t)}function U(){var e=C.current;return null===e&&g("307"),e}var q={Children:{map:function(e,t,n){if(null==e)return e;var r=[];return D(e,r,null,t,n),r},forEach:function(e,t,n){if(null==e)return e;I(e,M,t=F(null,null,t,n)),A(t)},count:function(e){return I(e,(function(){return null}),null)},toArray:function(e){var t=[];return D(e,t,null,(function(e){return e})),t},only:function(e){return K(e)||g("143"),e}},createRef:function(){return{current:null}},Component:k,PureComponent:S,createContext:function(e,t){return void 0===t&&(t=null),(e={$$typeof:u,_calculateChangedBits:t,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null}).Provider={$$typeof:b,_context:e},e.Consumer=e},forwardRef:function(e){return{$$typeof:p,render:e}},lazy:function(e){return{$$typeof:O,_ctor:e,_status:-1,_result:null}},memo:function(e,t){return{$$typeof:h,type:e,compare:void 0===t?null:t}},useCallback:function(e,t){return U().useCallback(e,t)},useContext:function(e,t){return U().useContext(e,t)},useEffect:function(e,t){return U().useEffect(e,t)},useImperativeHandle:function(e,t,n){return U().useImperativeHandle(e,t,n)},useDebugValue:function(){},useLayoutEffect:function(e,t){return U().useLayoutEffect(e,t)},useMemo:function(e,t){return U().useMemo(e,t)},useReducer:function(e,t,n){return U().useReducer(e,t,n)},useRef:function(e){return U().useRef(e)},useState:function(e){return U().useState(e)},Fragment:i,StrictMode:l,Suspense:d,createElement:R,cloneElement:function(e,t,n){null==e&&g("267",e);var o=void 0,a=r({},e.props),i=e.key,l=e.ref,s=e._owner;if(null!=t){void 0!==t.ref&&(l=t.ref,s=E.current),void 0!==t.key&&(i=""+t.key);var b=void 0;for(o in e.type&&e.type.defaultProps&&(b=e.type.defaultProps),t)x.call(t,o)&&!P.hasOwnProperty(o)&&(a[o]=void 0===t[o]&&void 0!==b?b[o]:t[o])}if(1===(o=arguments.length-2))a.children=n;else if(1<o){b=Array(o);for(var u=0;u<o;u++)b[u]=arguments[u+2];a.children=b}return{$$typeof:c,type:e.type,key:i,ref:l,props:a,_owner:s}},createFactory:function(e){var t=R.bind(null,e);return t.type=e,t},isValidElement:K,version:"16.8.4",unstable_ConcurrentMode:f,unstable_Profiler:s,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentDispatcher:C,ReactCurrentOwner:E,assign:r}},z={default:q},W=z&&q||z;e.exports=W.default||W},183:function(e,t,n){"use strict";var r=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,c=Object.prototype.propertyIsEnumerable;function a(e){if(null==e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}e.exports=function(){try{if(!Object.assign)return!1;var e=new String("abc");if(e[5]="de","5"===Object.getOwnPropertyNames(e)[0])return!1;for(var t={},n=0;n<10;n++)t["_"+String.fromCharCode(n)]=n;if("0123456789"!==Object.getOwnPropertyNames(t).map((function(e){return t[e]})).join(""))return!1;var r={};return"abcdefghijklmnopqrst".split("").forEach((function(e){r[e]=e})),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},r)).join("")}catch(o){return!1}}()?Object.assign:function(e,t){for(var n,i,l=a(e),s=1;s<arguments.length;s++){for(var b in n=Object(arguments[s]))o.call(n,b)&&(l[b]=n[b]);if(r){i=r(n);for(var u=0;u<i.length;u++)c.call(n,i[u])&&(l[i[u]]=n[i[u]])}}return l}}}]);