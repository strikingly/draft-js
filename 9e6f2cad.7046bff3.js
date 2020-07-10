/*! For license information please see 9e6f2cad.7046bff3.js.LICENSE.txt */
(window.webpackJsonp=window.webpackJsonp||[]).push([[24],{161:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return a})),n.d(t,"metadata",(function(){return c})),n.d(t,"rightToc",(function(){return l})),n.d(t,"default",(function(){return s}));var o=n(2),r=n(9),i=(n(181),n(180)),a={id:"advanced-topics-block-components",title:"Custom Block Components"},c={id:"advanced-topics-block-components",title:"Custom Block Components",description:"Draft is designed to solve problems for straightforward rich text interfaces",source:"@site/../docs/Advanced-Topics-Block-Components.md",permalink:"/docs/advanced-topics-block-components",editUrl:"https://github.com/facebook/draft-js/edit/master/docs/../docs/Advanced-Topics-Block-Components.md",lastUpdatedBy:"Kevin Chavez",lastUpdatedAt:1585041753,sidebar:"docs",previous:{title:"Custom Block Rendering",permalink:"/docs/advanced-topics-custom-block-render-map"},next:{title:"Complex Inline Styles",permalink:"/docs/advanced-topics-inline-styles"}},l=[{value:"Custom Block Components",id:"custom-block-components",children:[]},{value:"Defining custom block components",id:"defining-custom-block-components",children:[]},{value:"Recommendations and other notes",id:"recommendations-and-other-notes",children:[]}],u={rightToc:l};function s(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(i.b)("wrapper",Object(o.a)({},u,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"Draft is designed to solve problems for straightforward rich text interfaces\nlike comments and chat messages, but it also powers richer editor experiences\nlike ",Object(i.b)("a",Object(o.a)({parentName:"p"},{href:"https://www.facebook.com/notes/"}),"Facebook Notes"),"."),Object(i.b)("p",null,"Users can embed images within their Notes, either loading from their existing\nFacebook photos or by uploading new images from the desktop. To that end,\nthe Draft framework supports custom rendering at the block level, to render\ncontent like rich media in place of plain text."),Object(i.b)("p",null,"The ",Object(i.b)("a",Object(o.a)({parentName:"p"},{href:"https://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/tex"}),"TeX editor"),"\nin the Draft repository provides a live example of custom block rendering, with\nTeX syntax translated on the fly into editable embedded formula rendering via the\n",Object(i.b)("a",Object(o.a)({parentName:"p"},{href:"https://khan.github.io/KaTeX/"}),"KaTeX library"),"."),Object(i.b)("p",null,"A ",Object(i.b)("a",Object(o.a)({parentName:"p"},{href:"https://github.com/facebook/draft-js/tree/master/examples/draft-0-10-0/media"}),"media example")," is also\navailable, which showcases custom block rendering of audio, image, and video."),Object(i.b)("p",null,"By using a custom block renderer, it is possible to introduce complex rich\ninteractions within the frame of your editor."),Object(i.b)("h2",{id:"custom-block-components"},"Custom Block Components"),Object(i.b)("p",null,"Within the ",Object(i.b)("inlineCode",{parentName:"p"},"Editor")," component, one may specify the ",Object(i.b)("inlineCode",{parentName:"p"},"blockRendererFn")," prop.\nThis prop function allows a higher-level component to define custom React\nrendering for ",Object(i.b)("inlineCode",{parentName:"p"},"ContentBlock")," objects, based on block type, text, or other\ncriteria."),Object(i.b)("p",null,"For instance, we may wish to render ",Object(i.b)("inlineCode",{parentName:"p"},"ContentBlock")," objects of type ",Object(i.b)("inlineCode",{parentName:"p"},"'atomic'"),"\nusing a custom ",Object(i.b)("inlineCode",{parentName:"p"},"MediaComponent"),"."),Object(i.b)("pre",null,Object(i.b)("code",Object(o.a)({parentName:"pre"},{className:"language-js"}),"function myBlockRenderer(contentBlock) {\n  const type = contentBlock.getType();\n  if (type === 'atomic') {\n    return {\n      component: MediaComponent,\n      editable: false,\n      props: {\n        foo: 'bar',\n      },\n    };\n  }\n}\n\n// Then...\nimport {Editor} from 'draft-js';\nclass EditorWithMedia extends React.Component {\n  ...\n  render() {\n    return <Editor ... blockRendererFn={myBlockRenderer} />;\n  }\n}\n")),Object(i.b)("p",null,"If no custom renderer object is returned by the ",Object(i.b)("inlineCode",{parentName:"p"},"blockRendererFn")," function,\n",Object(i.b)("inlineCode",{parentName:"p"},"Editor")," will render the default ",Object(i.b)("inlineCode",{parentName:"p"},"EditorBlock")," text block component."),Object(i.b)("p",null,"The ",Object(i.b)("inlineCode",{parentName:"p"},"component")," property defines the component to be used, while the optional\n",Object(i.b)("inlineCode",{parentName:"p"},"props")," object includes props that will be passed through to the rendered\ncustom component via the ",Object(i.b)("inlineCode",{parentName:"p"},"props.blockProps")," sub property object. In addition,\nthe optional ",Object(i.b)("inlineCode",{parentName:"p"},"editable")," property determines whether the custom component is\n",Object(i.b)("inlineCode",{parentName:"p"},"contentEditable"),"."),Object(i.b)("p",null,"It is strongly recommended that you use ",Object(i.b)("inlineCode",{parentName:"p"},"editable: false")," if your custom\ncomponent will not contain text."),Object(i.b)("p",null,"If your component contains text as provided by your ",Object(i.b)("inlineCode",{parentName:"p"},"ContentState"),", your custom\ncomponent should compose an ",Object(i.b)("inlineCode",{parentName:"p"},"EditorBlock")," component. This will allow the\nDraft framework to properly maintain cursor behavior within your contents."),Object(i.b)("p",null,"By defining this function within the context of a higher-level component,\nthe props for this custom component may be bound to that component, allowing\ninstance methods for custom component props."),Object(i.b)("h2",{id:"defining-custom-block-components"},"Defining custom block components"),Object(i.b)("p",null,"Within ",Object(i.b)("inlineCode",{parentName:"p"},"MediaComponent"),", the most likely use case is that you will want to\nretrieve entity metadata to render your custom block. You may apply an entity\nkey to the text within a ",Object(i.b)("inlineCode",{parentName:"p"},"'atomic'")," block during ",Object(i.b)("inlineCode",{parentName:"p"},"EditorState")," management,\nthen retrieve the metadata for that key in your custom component ",Object(i.b)("inlineCode",{parentName:"p"},"render()"),"\ncode."),Object(i.b)("pre",null,Object(i.b)("code",Object(o.a)({parentName:"pre"},{className:"language-js"}),"class MediaComponent extends React.Component {\n  render() {\n    const {block, contentState} = this.props;\n    const {foo} = this.props.blockProps;\n    const data = contentState.getEntity(block.getEntityAt(0)).getData();\n    // Return a <figure> or some other content using this data.\n  }\n}\n")),Object(i.b)("p",null,"The ",Object(i.b)("inlineCode",{parentName:"p"},"ContentBlock")," object and the ",Object(i.b)("inlineCode",{parentName:"p"},"ContentState")," record are made available\nwithin the custom component, along with the props defined at the top level. By\nextracting entity information from the ",Object(i.b)("inlineCode",{parentName:"p"},"ContentBlock")," and the ",Object(i.b)("inlineCode",{parentName:"p"},"Entity")," map, you\ncan obtain the metadata required to render your custom component."),Object(i.b)("p",null,Object(i.b)("em",{parentName:"p"},"Retrieving the entity from the block is admittedly a bit of an awkward API,\nand is worth revisiting.")),Object(i.b)("h2",{id:"recommendations-and-other-notes"},"Recommendations and other notes"),Object(i.b)("p",null,"If your custom block renderer requires mouse interaction, it is often wise\nto temporarily set your ",Object(i.b)("inlineCode",{parentName:"p"},"Editor")," to ",Object(i.b)("inlineCode",{parentName:"p"},"readOnly={true}")," during this\ninteraction. In this way, the user does not trigger any selection changes within\nthe editor while interacting with the custom block. This should not be a problem\nwith respect to editor behavior, since interacting with your custom block\ncomponent is most likely mutually exclusive from text changes within the editor."),Object(i.b)("p",null,"The recommendation above is especially important for custom block renderers\nthat involve text input, like the TeX editor example."),Object(i.b)("p",null,"It is also worth noting that within the Facebook Notes editor, we have not\ntried to perform any specific SelectionState rendering or management on embedded\nmedia, such as rendering a highlight on an embedded photo when selecting it.\nThis is in part because of the rich interaction provided on the media\nitself, with resize handles and other controls exposed to mouse behavior."),Object(i.b)("p",null,"Since an engineer using Draft has full awareness of the selection state\nof the editor and full control over native Selection APIs, it would be possible\nto build selection behavior on static embedded media if desired. So far, though,\nwe have not tried to solve this at Facebook, so we have not packaged solutions\nfor this use case into the Draft project at this time."))}s.isMDXComponent=!0},180:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return m}));var o=n(0),r=n.n(o);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var u=r.a.createContext({}),s=function(e){var t=r.a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},p=function(e){var t=s(e.components);return r.a.createElement(u.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},f=r.a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,a=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),p=s(n),f=o,m=p["".concat(a,".").concat(f)]||p[f]||d[f]||i;return n?r.a.createElement(m,c(c({ref:t},u),{},{components:n})):r.a.createElement(m,c({ref:t},u))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=f;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:o,a[1]=c;for(var u=2;u<i;u++)a[u]=n[u];return r.a.createElement.apply(null,a)}return r.a.createElement.apply(null,n)}f.displayName="MDXCreateElement"},181:function(e,t,n){"use strict";e.exports=n(182)},182:function(e,t,n){"use strict";var o=n(183),r="function"==typeof Symbol&&Symbol.for,i=r?Symbol.for("react.element"):60103,a=r?Symbol.for("react.portal"):60106,c=r?Symbol.for("react.fragment"):60107,l=r?Symbol.for("react.strict_mode"):60108,u=r?Symbol.for("react.profiler"):60114,s=r?Symbol.for("react.provider"):60109,p=r?Symbol.for("react.context"):60110,d=r?Symbol.for("react.concurrent_mode"):60111,f=r?Symbol.for("react.forward_ref"):60112,m=r?Symbol.for("react.suspense"):60113,b=r?Symbol.for("react.memo"):60115,h=r?Symbol.for("react.lazy"):60116,y="function"==typeof Symbol&&Symbol.iterator;function v(e,t,n,o,r,i,a,c){if(!e){if(e=void 0,void 0===t)e=Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var l=[n,o,r,i,a,c],u=0;(e=Error(t.replace(/%s/g,(function(){return l[u++]})))).name="Invariant Violation"}throw e.framesToPop=1,e}}function j(e){for(var t=arguments.length-1,n="https://reactjs.org/docs/error-decoder.html?invariant="+e,o=0;o<t;o++)n+="&args[]="+encodeURIComponent(arguments[o+1]);v(!1,"Minified React error #"+e+"; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",n)}var g={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},O={};function k(e,t,n){this.props=e,this.context=t,this.refs=O,this.updater=n||g}function w(){}function C(e,t,n){this.props=e,this.context=t,this.refs=O,this.updater=n||g}k.prototype.isReactComponent={},k.prototype.setState=function(e,t){"object"!=typeof e&&"function"!=typeof e&&null!=e&&j("85"),this.updater.enqueueSetState(this,e,t,"setState")},k.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")},w.prototype=k.prototype;var x=C.prototype=new w;x.constructor=C,o(x,k.prototype),x.isPureReactComponent=!0;var S={current:null},N={current:null},E=Object.prototype.hasOwnProperty,P={key:!0,ref:!0,__self:!0,__source:!0};function _(e,t,n){var o=void 0,r={},a=null,c=null;if(null!=t)for(o in void 0!==t.ref&&(c=t.ref),void 0!==t.key&&(a=""+t.key),t)E.call(t,o)&&!P.hasOwnProperty(o)&&(r[o]=t[o]);var l=arguments.length-2;if(1===l)r.children=n;else if(1<l){for(var u=Array(l),s=0;s<l;s++)u[s]=arguments[s+2];r.children=u}if(e&&e.defaultProps)for(o in l=e.defaultProps)void 0===r[o]&&(r[o]=l[o]);return{$$typeof:i,type:e,key:a,ref:c,props:r,_owner:N.current}}function T(e){return"object"==typeof e&&null!==e&&e.$$typeof===i}var R=/\/+/g,B=[];function $(e,t,n,o){if(B.length){var r=B.pop();return r.result=e,r.keyPrefix=t,r.func=n,r.context=o,r.count=0,r}return{result:e,keyPrefix:t,func:n,context:o,count:0}}function D(e){e.result=null,e.keyPrefix=null,e.func=null,e.context=null,e.count=0,10>B.length&&B.push(e)}function I(e,t,n){return null==e?0:function e(t,n,o,r){var c=typeof t;"undefined"!==c&&"boolean"!==c||(t=null);var l=!1;if(null===t)l=!0;else switch(c){case"string":case"number":l=!0;break;case"object":switch(t.$$typeof){case i:case a:l=!0}}if(l)return o(r,t,""===n?"."+A(t,0):n),1;if(l=0,n=""===n?".":n+":",Array.isArray(t))for(var u=0;u<t.length;u++){var s=n+A(c=t[u],u);l+=e(c,s,o,r)}else if(null===t||"object"!=typeof t?s=null:s="function"==typeof(s=y&&t[y]||t["@@iterator"])?s:null,"function"==typeof s)for(t=s.call(t),u=0;!(c=t.next()).done;)l+=e(c=c.value,s=n+A(c,u++),o,r);else"object"===c&&j("31","[object Object]"===(o=""+t)?"object with keys {"+Object.keys(t).join(", ")+"}":o,"");return l}(e,"",t,n)}function A(e,t){return"object"==typeof e&&null!==e&&null!=e.key?function(e){var t={"=":"=0",":":"=2"};return"$"+(""+e).replace(/[=:]/g,(function(e){return t[e]}))}(e.key):t.toString(36)}function M(e,t){e.func.call(e.context,t,e.count++)}function F(e,t,n){var o=e.result,r=e.keyPrefix;e=e.func.call(e.context,t,e.count++),Array.isArray(e)?U(e,o,n,(function(e){return e})):null!=e&&(T(e)&&(e=function(e,t){return{$$typeof:i,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}(e,r+(!e.key||t&&t.key===e.key?"":(""+e.key).replace(R,"$&/")+"/")+n)),o.push(e))}function U(e,t,n,o,r){var i="";null!=n&&(i=(""+n).replace(R,"$&/")+"/"),I(e,F,t=$(t,i,o,r)),D(t)}function q(){var e=S.current;return null===e&&j("307"),e}var X={Children:{map:function(e,t,n){if(null==e)return e;var o=[];return U(e,o,null,t,n),o},forEach:function(e,t,n){if(null==e)return e;I(e,M,t=$(null,null,t,n)),D(t)},count:function(e){return I(e,(function(){return null}),null)},toArray:function(e){var t=[];return U(e,t,null,(function(e){return e})),t},only:function(e){return T(e)||j("143"),e}},createRef:function(){return{current:null}},Component:k,PureComponent:C,createContext:function(e,t){return void 0===t&&(t=null),(e={$$typeof:p,_calculateChangedBits:t,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null}).Provider={$$typeof:s,_context:e},e.Consumer=e},forwardRef:function(e){return{$$typeof:f,render:e}},lazy:function(e){return{$$typeof:h,_ctor:e,_status:-1,_result:null}},memo:function(e,t){return{$$typeof:b,type:e,compare:void 0===t?null:t}},useCallback:function(e,t){return q().useCallback(e,t)},useContext:function(e,t){return q().useContext(e,t)},useEffect:function(e,t){return q().useEffect(e,t)},useImperativeHandle:function(e,t,n){return q().useImperativeHandle(e,t,n)},useDebugValue:function(){},useLayoutEffect:function(e,t){return q().useLayoutEffect(e,t)},useMemo:function(e,t){return q().useMemo(e,t)},useReducer:function(e,t,n){return q().useReducer(e,t,n)},useRef:function(e){return q().useRef(e)},useState:function(e){return q().useState(e)},Fragment:c,StrictMode:l,Suspense:m,createElement:_,cloneElement:function(e,t,n){null==e&&j("267",e);var r=void 0,a=o({},e.props),c=e.key,l=e.ref,u=e._owner;if(null!=t){void 0!==t.ref&&(l=t.ref,u=N.current),void 0!==t.key&&(c=""+t.key);var s=void 0;for(r in e.type&&e.type.defaultProps&&(s=e.type.defaultProps),t)E.call(t,r)&&!P.hasOwnProperty(r)&&(a[r]=void 0===t[r]&&void 0!==s?s[r]:t[r])}if(1===(r=arguments.length-2))a.children=n;else if(1<r){s=Array(r);for(var p=0;p<r;p++)s[p]=arguments[p+2];a.children=s}return{$$typeof:i,type:e.type,key:c,ref:l,props:a,_owner:u}},createFactory:function(e){var t=_.bind(null,e);return t.type=e,t},isValidElement:T,version:"16.8.4",unstable_ConcurrentMode:d,unstable_Profiler:u,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentDispatcher:S,ReactCurrentOwner:N,assign:o}},L={default:X},V=L&&X||L;e.exports=V.default||V},183:function(e,t,n){"use strict";var o=Object.getOwnPropertySymbols,r=Object.prototype.hasOwnProperty,i=Object.prototype.propertyIsEnumerable;function a(e){if(null==e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}e.exports=function(){try{if(!Object.assign)return!1;var e=new String("abc");if(e[5]="de","5"===Object.getOwnPropertyNames(e)[0])return!1;for(var t={},n=0;n<10;n++)t["_"+String.fromCharCode(n)]=n;if("0123456789"!==Object.getOwnPropertyNames(t).map((function(e){return t[e]})).join(""))return!1;var o={};return"abcdefghijklmnopqrst".split("").forEach((function(e){o[e]=e})),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},o)).join("")}catch(r){return!1}}()?Object.assign:function(e,t){for(var n,c,l=a(e),u=1;u<arguments.length;u++){for(var s in n=Object(arguments[u]))r.call(n,s)&&(l[s]=n[s]);if(o){c=o(n);for(var p=0;p<c.length;p++)i.call(n,c[p])&&(l[c[p]]=n[c[p]])}}return l}}}]);