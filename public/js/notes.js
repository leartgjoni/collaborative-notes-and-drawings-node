document.addEventListener("DOMContentLoaded", function() {

    var uid = uid();
    var notes_textarea = $('#notes_textarea');
    var done_notes = $('#done_notes');
    var socket  = io.connect();

    done_notes.prop("disabled",true);
    socket.on('startup', function(data){

        notes_textarea.val(data.notes);

        if(data.notes_taken == 1){
            notes_textarea.prop("disabled", true);
        }else{
            notes_textarea.prop("disabled", false);
        }
    });

    notes_textarea.click(function () {
        done_notes.prop("disabled",false);
        socket.emit('notes_taken', uid);
    });

    done_notes.click(function(){
        socket.emit("notes_free");
        done_notes.prop("disabled",true);
    });

    notes_textarea.keyup(function(){
        socket.emit("notes_content", { notes: $(this).val(), uid: uid});
    });

    socket.on('notes_taken', function(remote_uid){
        if( remote_uid != uid ){
            notes_textarea.prop("disabled", true);
        }
    });

    socket.on('notes_content', function(data){
        if( data.uid != uid ) {
            notes_textarea.val(data.notes);
        }
    });

    socket.on('notes_free', function(){
        notes_textarea.prop("disabled", false);
    });

    window.onbeforeunload = function() {
        //before leaving if you are writing or nobody else is writing free notes
        if(notes_textarea.prop("disabled") == false)
            socket.emit("notes_free");
    };

    function uid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
});