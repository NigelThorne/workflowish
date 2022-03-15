function edit_node(node){
    if(node === undefined || node.length == 0) return;
    var prev_node = window.current_node;
    var txt = node_text(node);
    window.current_node = node;
    $("#editor")[0].value = txt.trim();
    $("#editor").focus();
    move_editor_to_node(node);
    if(prev_node && node_text(prev_node)=="") remove(prev_node);
};



function swap_with_next(node){
    node.insertAfter(node.next());
    move_editor_to_node(node);
};

function swap_with_previous(node){
    node.prev().insertAfter(node);
    move_editor_to_node(node);
};

function outdent(node){
    node.insertAfter(parent_node(node));
    move_editor_to_node(node);
};

function indent(node){
    node.appendTo(items(node.prev()));
    move_editor_to_node(node);
};

function remove(node){
    edit_node(node.prev() || node.next());
    if(window.current_node)
        node.remove();
    else
    {
        window.current_node=node;
        edit_node(node);
    }
};

function add_sibling(node){
    return create_node().insertAfter(node);
};



function next(node){
    if(node.length === 0) return null
    return $(node.next()[0] || next(parent_node(node)));
};

function prev(node){
    return $(node.prev()[0] || parent_node(node));
};

function next_line(node){
    return $(first_child_node(node)[0] || next(node)[0]);
};

function prev_line(node){
    return $(last_child_node(node.prev())[0] || prev(node)[0] );
};



function parent_node(node){
    return node.parents(".node").first()
};	

function first_child_node(node){
    return node.find(".node").first()
};	

function last_child_node(node){
    return node.find(".node").last()
};	
        
function items(node){
    return node.children("ul");
};

function create_node(){
    return $( "#nodeTemplate" ).tmpl( {name: "", nodes: []} );
};

function node_text(node){
    return node.children("span").text();
};

function set_node_text(node, text){
    return node.children("span").text(text);
};

////////////////////////////////////////
//       end of node methods          //
////////////////////////////////////////


// enter => add following sibling
// ctrl up => swap with prev
// ctrl down => swap with next
// ctrl right => indent
// ctrl left => outdent
/// backspace empty textbox => remove 
$("#editor").jkey('enter', function(){
    onEnter(this);
}).jkey('backspace', true, function(){
    return onBackspace(this);
});


const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_TAB = 9;

$(document).keydown(function(event){
    if(event.keyCode == KEY_TAB){ 
        if(event.shiftKey) {
            outdent(window.current_node);
            return false;
        }
        else {
            indent(window.current_node);
            return false;
        }
    }
    if(event.ctrlKey && event.altKey){
        if(event.keyCode ==  KEY_LEFT){ 
            outdent(window.current_node);
            return false;
        };
        if(event.keyCode ==  KEY_RIGHT){ 
            indent(window.current_node);
            return false;
        };
        if(event.keyCode ==  KEY_DOWN){ 
            swap_with_next(window.current_node);
            return false;
        };
        if(event.keyCode ==  KEY_UP){ 
            swap_with_previous(window.current_node);
            return false;
        };
    }
    else if(event.altKey){
        if(event.keyCode ==  KEY_LEFT){ 
            edit_node( parent_node(window.current_node));
            return false;
        };
        if(event.keyCode ==  KEY_RIGHT){ 
            edit_node( first_child_node(window.current_node));
            return false;
        };
        if(event.keyCode ==  KEY_DOWN){ 				
            edit_node(next(window.current_node));
            return false;
        };
        if(event.keyCode ==  KEY_UP){ 
            edit_node(prev(window.current_node));
            return false;
        };
    }
    else {
        if(event.keyCode ==  KEY_DOWN){ 				
            edit_node(next_line(window.current_node));
            return false;
        };
        if(event.keyCode ==  KEY_UP){ 
            edit_node(prev_line(window.current_node));
            return false;
        };
    }
});
	
function onBackspace(context) {
    // TODO: don't delete the last node.
    if (context.value.length == 0) {
        remove(window.current_node);
        return false;
    };
    return true;
}

function onEnter(context) {
    if (context.value.length == 0) {
        remove(window.current_node);
    }
    else {
        edit_node(add_sibling(window.current_node));
    }
}

function move_editor_to_node(node){
    var p = node.position();
    $("#editor").css("top",p.top -2).css("left", p.left - 2);
};

function on_span_clicked(){
    edit_node($(this).parent());
};

function set_editor_width_from_node(node){
    // uses li  not span
    $("#editor").css("width", window.current_node.css("width"));
}

function update_node_from_editor(){
    set_node_text(window.current_node, $("#editor")[0].value);
    set_editor_width_from_node(window.current_node);
};	

function loadFileAsText()
{
    var fileToLoad = document.getElementById("fileToLoad").files[0];

    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) 
    {
        var textFromFileLoaded = fileLoadedEvent.target.result;
//		eval("rootNode = " + textFromFileLoaded); // assumes json
        
//		$("#pageTemplate").tmpl(rootNode).appendTo($("body"));
        eval('$("#tree").html(' + textFromFileLoaded + ')');
        $(".node > span").live("click", on_span_clicked);
        edit_node($(".node").first());
        setInterval("update_node_from_editor()",100);
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
}

function saveTextAsFile()
{
    var fileNameToSaveAs = document.getElementById("inputFileName").value;
    saveToFile(JSON.stringify($("#tree").html()), fileNameToSaveAs);        
}

function saveToFile(textToWrite, fileNameToSaveAs)
{
    var textFileAsBlob = new Blob([textToWrite], {type:'text/json'});

    var downloadLink = document.createElement("a");
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    downloadLink.download = fileNameToSaveAs;
    downloadLink.click();    
}
