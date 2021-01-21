let prevLocalization = [-420]

function Communication(method, options, callback){
    chrome.runtime.sendMessage({method: method, options: options}, function(response) {
        if(callback){
            callback(response);
        }
    });
}

function getContent(id_parent = null) {
    Communication(actions.getcontent, id_parent, function(call){
        if(call==response.tokenError) {
            $('.memeCloud-form').attr('style','display:block');
            $('.memeCloud-nav').attr('style','display:none');
        }

        ($('.memeCloud-currentLocalization').val() == -420 ? $('.memeCloud-backButton').attr('style','display:none') : $('.memeCloud-backButton').attr('style','display: inline-block'));

        $('.memeCloud-memes').empty();
        $('.memeCloud-localizations').empty();

        $(call.path).each(function(){
            $('.memeCloud-localizations').append('<div class="memeCloud-directoryRow"><div class="memeCloud-directory" data-id="'+this.id+'">📁 '+this.name+'</div><span class="memeCloud-directorySettings"> ... </span></div>')
        })

        $(call.meme).each(function(index, value){
            $('.memeCloud-memes').append('<div class="memeCloud-memeContainer"><img class="memeCloud-meme btn" crossorigin="anonymous"  id="'+index+'" src="https://memecloud.co/imgs/'+this.checksum+'.jpeg" /></div>');
        });
    })
}

$(document).ready(function(){
    let arr = document.getElementsByTagName('img');

    for (let index = 0; index < arr.length; ++index) {
        let btn = document.createElement("a");
        btn.innerHTML= "M";
        btn.setAttribute('class','memeCloud-addbtn');
        btn.setAttribute('href','###');
        btn.setAttribute('data-url', arr[index].getAttribute('src'));

        if(arr[index].width > 250 && arr[index].height > 250)
            arr[index].parentElement.appendChild(btn);
    }

    let box = $('<div id="memeCloud" style="right: -320px;"></div>').html('<button class="btn btn-primary memeCloud-sidetab" data-toggle="modal" data-target="#memeCloud-panel" >+</button>'
                                                                            +'<div class="modal memeCloud-panel" id="memeCloud-panel" tabindex="-1" role="dialog">'
                                                                                +'<div class="modal-dialog">'
                                                                                    +'<div class="modal-content">'
                                                                                        +'<div class="modal-header">'
                                                                                    
                                                                                            +'<img class="memeCloud-logo" src="https://memecloud.co/assets/img/logo_extension.png"/>'
                                                                                            +'<canvas id="memeCloud-canvas" crossorigin="anonymous"></canvas>'
                                                                                            +'<h2>MEMECLOUD.CO</h2>'
                                                                                        
                                                                                        +'</div>'

                                                                                        +'<div class="modal-body">'

                                                                                            +'<input type="hidden" class="memeCloud-currentLocalization" value="-420" />'
                                                                                            +'<div class="memeCloud-nav">'
                                                                                                +'<button class="memeCloud-backButton">⬅</button>'
                                                                                                +'<button class="memeCloud-logoutButton"> 🗝 </button>'
                                                                                            +'</div>'
                                                                                            +'<div class="memeCloud-localizations"></div>'
                                                                                            +'<div class="memeCloud-memes"></div>'
                                                                                            +'<div class="memeCloud-form">'
                                                                                                +'<form>'
                                                                                                    +'<input type="text" id="memeCloud-login" class="memeCloud-formfield"  placeholder="Login" /><hr>'
                                                                                                    +'<input type="password" id="memeCloud-passwd" class="memeCloud-formfield" placeholder="Password" autocomplete="on" /><hr>'
                                                                                                    +'<button class="memeCloud-btn">Sing In</buton>'
                                                                                                +'</form>'
                                                                                            +'</div>'

                                                                                        +'</div>'
                                                                                        +'<div class="modal-footer">'
                                                                                        +'</div>'
                                                                                    +'</div>'
                                                                                +'</div>'
                                                                            +'</div>');
    $('body').append(box);

    //new img lazy loaded or something like that
    $('img').on('load', function(){
        let btn = document.createElement("a");
        btn.innerHTML= "M";
        btn.setAttribute('class','memeCloud-addbtn');
        btn.setAttribute('href','###');
        btn.setAttribute('data-url', $(this).attr('src'));

        if($(this).width() > 250 && $(this).height() > 250){
            $(this).parent().append(btn);
            console.log($(this).width());
        }
    });
})

$(document).on('click', '.memeCloud-addbtn', function(event){
    event.preventDefault();
    
    let url = $(this).data('url');
    let name = prompt("Podaj nawzwe mema");

    let data = {
                url: url,
                name: name
            };
    if(name){
        Communication(actions.addmeme, data, function(call){
            if(call != response.tokenError){
                console.log(call);
            }
        });
    }
})

$(document).on('click', '.memeCloud-sidetab', function(){
    if($('#memeCloud').attr('style') == 'right: -320px'){
        $('#memeCloud').attr('style', 'right: 0px');

        Communication(actions.auth, 'default', function(call){
            if(call === response.Auth){
                $('.memeCloud-form').hide();
                $('.memeCloud-nav').show();
                ($('.memeCloud-currentLocalization').val() == -420 ? getContent() : getContent($('.memeCloud-currentLocalization').val()));
            }else{
                $('.memeCloud-form').show();
                $('.memeCloud-nav').hide();
            }
        });
    }else
        $('#memeCloud').attr('style', 'right: -320px');
})

$(document).on('click', '.memeCloud-btn', function(){
    let usr = {
        login: $('#memeCloud-login').val(),
        passwd: $('#memeCloud-passwd').val()
    }

    Communication(actions.signin, usr, function(call){
        if(call == response.logged){
            $('.memeCloud-form').attr('style','display:none');
            getContent();
        }else{
            $('.memeCloud-form').attr('style','display:block');
        }
    })
})

$(document).on('click', '.memeCloud-backButton', function(){
    if(prevLocalization.length > 1){
        let localization = prevLocalization.pop();
        getContent(localization);
        $('.memeCloud-currentLocalization').val(localization);
    }else{
        getContent();
        $('.memeCloud-currentLocalization').val(-420);
    }
})

$(document).on('click', '.memeCloud-meme', async function(){
    let c = document.getElementById('memeCloud-canvas');
    let img = this;

    c.width = $(img).prop('naturalWidth');
    c.height = $(img).prop('naturalHeight');

    let ctx = c.getContext("2d");
    ctx.drawImage(img,0,0);

    c.toBlob(function(blob) {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]);
        alert("Meme copied!\n Just paste it wherever u want");
    });

})

$(document).on('click', '.memeCloud-directory', function(){
    let currentLocalization = $('.memeCloud-currentLocalization').val();

    if(currentLocalization != -420)
        prevLocalization.push(currentLocalization);

    $('.memeCloud-currentLocalization').val($(this).data('id'));
    getContent($(this).data('id'));
})

$(document).on('click', '.memeCloud-logoutButton', function(){
    Communication(actions.logout, $(this), function(call){
        (call==response.logout ? getContent() : '');
    })
})

$(document).on('click', '.memeCloud-directorySettings', function(){
    alert('chuj');
})



/* fetch do controllera
fetch('https://memecloud.co/api/extension', {
    method: 'POST',
    headers: new Headers({
        'Authorization':  'Bearer '+ token,
    }),
    body: url
})
.then(response => response.text())
.then(data => {
    console.log(data);
});*/