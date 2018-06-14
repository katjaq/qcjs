const ipc = require('electron').ipcRenderer
const holder = document.getElementById('holder')

dirPath;-
/*
    Drag & drop
*/
holder.ondragover = function (){
    return false;
}
holder.ondragleave = holder.ondragend = function (){
    return false;
}
holder.ondrop = function (e){
    e.preventDefault()
    var f = e.dataTransfer.files[0];
    console.log('Directory you dragged here: ', f.path)
    dirPath = f.path;
    ipc.send('asynchronous-message', f.path)
    

    return false;
}

/*
    Main/Renderer communication
*/
ipc.on('asynchronous-reply', function(event, arg) {
    //const message = `${arg}`
    //arg=JSON.parse(arg);
    //console.log(message);
    jQuery('#holder').remove()
    $('#qcjs').show();
    appendSubjectsTable(JSON.parse(arg));
//    document.getElementById('qcjs').innerHTML = JSON.stringify(arg);
    $('#dataType').show();
})

/*
    Collaboration
*/
Y({
    db: {
        name: 'memory'          // use memory database adapter.
        // name: 'indexeddb'    // use indexeddb database adapter instead for offline apps
    },
    connector: {
        name: 'webrtc',         // use webrtc connector
        // name: 'websockets-client'
        // name: 'xmpp'
        room: 'my-room'         // clients connecting to the same room share data
    },
    sourceDir: 'bower_components',
    // location of the y-* modules (browser only)
    share: {
        //textarea: 'Text',
        // y.share.textarea is of type y-text
        map: 'Map'
    }
}).then(function(y) {
    // The Yjs instance `y` is available
    // y.share.* contains the shared types
    // Bind `y.share.textarea` to `<textarea/>`
    // y.share.textarea.bind(document.querySelector('#mychat'))
    window.y = y;
    console.log('good to go');
});


/*
    Subject table handling
*/
var subjects;
var selectedRow = 0, previousSelectedRow;

function appendSubjectsTable(dir) {
    
    subjects = dir;
    
    // Append table
    var arr=[
        '<table>',
            '<thead>',
                '<tr>',
                '<th>Subject</th>',
                '<th>QC</th>',
                '<th>Comments</th>',
                '</tr>',
            '</thead>',
            '<tbody>'
    ];
    for(i in dir) {
        arr.push([
            '<tr>',
            '<td>',dir[i],'</td>',
            '<td class="qc" contenteditable></td>',
            '<td class="comment" contenteditable></td>',
            '</tr>',
        ].join(''));
    }
    arr.push('</tbody></table>')
    $('#qcjs #subjectList').append(arr.join('\n'));
    
    // Select row and add listener for row selection on click
    selectRow();
    $('#subjectList tbody tr').on('click', function (e) {
        previousSelectedRow = selectedRow;
        selectedRow = $('#subjectList tbody tr').index(this);
        selectRow();
    });
    
    // bind Yjs
    for(s in subjects) {
        var map;
        y.share.map.set(subjects[s],Y.Map);
        map = y.share.map.get(subjects[s]);
        console.log(map);
        console.log(subjects[s]);
        map.set('QC',null);
        map.set('Comments',null);
    }
    y.share.map.observeDeep(observe);
}

function observe(e) {
    console.log('observed:');
    console.log('type',e.type);
    console.log('name',e.name);
    console.log('value',e.value);
    console.log('path',e.path);
    var index = subjects.indexOf(e.path[0]);
    
    switch(e.name) {
        case 'QC':
            $('#subjectList tbody tr').eq(index).find('td.qc').text(e.value);
            break;
        case 'Comment':
            $('#subjectList tbody tr').eq(index).find('td.comment').text(e.value);
            break;
    }
            
}
function selectRow() {
    $('#subjectList tbody tr').removeClass('selected');
    $('#subjectList tbody tr').eq(selectedRow).addClass('selected');
    if(previousSelectedRow != selectedRow) {
        displaySubject(subjects[selectedRow]);
    }
}

$('body')
.on('keydown', function (e) {
    switch (e.keyCode) {
        case 38: // arrow up
            e.preventDefault();
            previousSelectedRow = selectedRow;
            selectedRow--;
            selectRow();
            break;
        case 40: // arrow down
            e.preventDefault();
            previousSelectedRow = selectedRow;
            selectedRow++;
            selectRow();
            break;
        case 13: // enter
            e.preventDefault();
            break;
    }
})
.on('focus', '[contenteditable]', function () {
    var row = $('#subjectList tbody tr').index($(this).closest('tr'));
    previousSelectedRow = selectedRow;
    selectedRow=row;
    selectRow();
})
.on('blur', '[contenteditable]', function () {
    var row = $('#subjectList tbody tr').index($(this).closest('tr'));
    var col = $('#subjectList tbody tr').eq(row).find('td').index(this) -1;
    var value = $(this).text();
    
    var map = y.share.map.get(subjects[row]);
    switch(col) {
        case 0: // QC
            map.set('QC',value);
            break;
        case 1: // Comment
            map.set('Comment',value);
            break;
    }
});


