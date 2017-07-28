!function(global,undefined){"use strict";function canUseNextTick(){return"object"==typeof process&&"[object process]"===Object.prototype.toString.call(process)}function canUseMessageChannel(){return!!global.MessageChannel}function canUsePostMessage(){if(!global.postMessage||global.importScripts)return!1;var e=!0,t=global.onmessage;return global.onmessage=function(){e=!1},global.postMessage("","*"),global.onmessage=t,e}function canUseReadyStateChange(){return"document"in global&&"onreadystatechange"in global.document.createElement("script")}function installNextTickImplementation(e){e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);return process.nextTick(function(){tasks.runIfPresent(e)}),e}}function installMessageChannelImplementation(e){var t=new global.MessageChannel;t.port1.onmessage=function(e){var t=e.data;tasks.runIfPresent(t)},e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);return t.port2.postMessage(e),e}}function installPostMessageImplementation(e){function t(e,t){return"string"==typeof e&&e.substring(0,t.length)===t}function n(e){if(e.source===global&&t(e.data,a)){var n=e.data.substring(a.length);tasks.runIfPresent(n)}}var a="com.bn.NobleJS.setImmediate"+Math.random();global.addEventListener?global.addEventListener("message",n,!1):global.attachEvent("onmessage",n),e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);return global.postMessage(a+e,"*"),e}}function installReadyStateChangeImplementation(e){e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments),t=global.document.createElement("script");return t.onreadystatechange=function(){tasks.runIfPresent(e),t.onreadystatechange=null,t.parentNode.removeChild(t),t=null},global.document.documentElement.appendChild(t),e}}function installSetTimeoutImplementation(e){e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);return global.setTimeout(function(){tasks.runIfPresent(e)},0),e}}var tasks=function(){function Task(e,t){this.handler=e,this.args=t}Task.prototype.run=function(){if("function"==typeof this.handler)this.handler.apply(undefined,this.args);else{var scriptSource=""+this.handler;eval(scriptSource)}};var nextHandle=1,tasksByHandle={},currentlyRunningATask=!1;return{addFromSetImmediateArguments:function(e){var t=e[0],n=Array.prototype.slice.call(e,1),a=new Task(t,n),s=nextHandle++;return tasksByHandle[s]=a,s},runIfPresent:function(e){if(currentlyRunningATask)global.setTimeout(function(){tasks.runIfPresent(e)},0);else{var t=tasksByHandle[e];if(t){currentlyRunningATask=!0;try{t.run()}finally{delete tasksByHandle[e],currentlyRunningATask=!1}}}},remove:function(e){delete tasksByHandle[e]}}}();if(!global.setImmediate){var attachTo="function"==typeof Object.getPrototypeOf&&"setTimeout"in Object.getPrototypeOf(global)?Object.getPrototypeOf(global):global;canUseNextTick()?installNextTickImplementation(attachTo):canUsePostMessage()?installPostMessageImplementation(attachTo):canUseMessageChannel()?installMessageChannelImplementation(attachTo):canUseReadyStateChange()?installReadyStateChangeImplementation(attachTo):installSetTimeoutImplementation(attachTo),attachTo.clearImmediate=tasks.remove}}("object"==typeof global&&global?global:this);