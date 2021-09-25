function getRelativeSelection (node) {
  var start = 0; 
  var end = 0; 
  var doc = node.ownerDocument || node.document || document; 
  var win = doc.defaultView || doc.parentWindow || window; 
  var sel; 
  if (typeof win.getSelection != 'undefined') { 
    sel = win.getSelection(); 
    if (sel.rangeCount > 0) { 
      var range = win.getSelection().getRangeAt(0); 
      var preCaretRange = range.cloneRange(); 
      preCaretRange.selectNodeContents(node); 
      preCaretRange.setEnd(range.startContainer, range.startOffset); 
      start = preCaretRange.toString().length; 
      preCaretRange.setEnd(range.endContainer, range.endOffset); 
      end = preCaretRange.toString().length; 
    } 
  } else if ( doc.selection && doc.selection.type != 'Control') { 
    sel = doc.selection; 
    var textRange = sel.createRange(); 
    var preCaretTextRange = doc.body.createTextRange(); 
    preCaretTextRange.moveToElementText(node); 
    preCaretTextRange.setEndPoint('EndToStart', textRange); 
    start = preCaretTextRange.text.length; 
    preCaretTextRange.setEndPoint('EndToEnd', textRange); 
    end = preCaretTextRange.text.length; 
  };
  return { start: start, end: end };
};

function setRelativeSelection (el,start,end) {
	var selection = document.getSelection();
	var range = document.createRange();
	withNodeAtCharacterOffset(el,start,(node,x) => { range.setStart(node,x); });
  withNodeAtCharacterOffset(el,end,(node,x) => { range.setEnd(node,x); });
  selection.removeAllRanges();
  selection.addRange(range);
};

function wrapSelection (el, start, end, tag) {
  var wrapper = document.createElement(tag);
  var nodes = [];
  getNodesInCharacterRange(el,start,end,nodes);
  for (var node of nodes) { wrapper.appendChild(node); };
  withNodeAtCharacterOffset(el,start,(node,x) => { node.parentNode.insertBefore(wrapper,node.nextSibling); });
}

function withNodeAtCharacterOffset (el, pos, f) {
  for(var node of el.childNodes){
    if(node.nodeType == 3){
      if(node.length >= pos){
        f(node,pos);
        return -1;
      }else{
        pos -= node.length;
      }
    }else{
      pos = withNodeAtCharacterOffset(node,pos,f);
      if(pos == -1){
        return -1;
      }
    }
  }
  return pos;
};

function getNodesInCharacterRange (el,start,end,result) {
  var pos = start;
  var pushing = false;
  for(var node of el.childNodes){
    if (!pushing) {
      if(node.nodeType == 3){
        if(node.length > pos){
          result.push(node.splitText(pos));
          pushing = true;
          pos = end - start;
        }else{
          pos -= node.length;
        }
      }else{
        pos = getNodesInCharacterRange(node,pos,end,result);
        if(pos == -1){
          return -1;
        }
      }
    } else {
      if(node.nodeType == 3){
        if(node.length >= pos){
          node.splitText(pos);
          result.push(node);
          return -1;
        }else{
          pos -= node.length;
        }
      }else{
        pos = getNodesInCharacterRange(node,pos,end,result);
        if(pos == -1){
          return -1;
        }
      }
    }
  }
  return pos;
}