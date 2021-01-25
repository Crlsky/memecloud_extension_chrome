let prevLocalization = [-420]

function Communication(method, options, callback){
    chrome.runtime.sendMessage({method: method, options: options}, function(response) {
        if(callback){
            callback(response);
        }
    });
}

$(document).ready(function(){
    makeButtonForImages();
    makeButtonForLazyLoadedImages();
    checkLogin();
})

function makeButtonForImages(){
    $('img').each(function(){
        let btn = document.createElement("dev");
        btn.innerHTML= "M";
        btn.setAttribute('class','memeCloud-addbtn');
        btn.setAttribute('data-url', $(this).attr('src'));
        btn.setAttribute('width', $(this).width());
        btn.setAttribute('heigth', $(this).height());

        if($(this).width() > 250 && $(this).height() > 250)
            $(this).closest('a').parent().append(btn);
        
    });
}

function makeButtonForLazyLoadedImages() {
    $('img').on('load', function(){
        let btn = document.createElement("dev");
        btn.innerHTML= "M";
        btn.setAttribute('class','memeCloud-addbtn');
        btn.setAttribute('data-url', $(this).attr('src'));
        btn.setAttribute('width', $(this).width());
        btn.setAttribute('heigth', $(this).height());
    
        if($(this).width() > 250 && $(this).height() > 250)
            $(this).closest('a').parent().append(btn);
        
    });
}

function checkLogin() {
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
}

function getContent(id_parent = null) {
    Communication(actions.getcontent, id_parent, function(call){
        if(call==response.tokenError) {
            $('.memeCloud-form').attr('style','display:block');
            $('.memeCloud-nav').attr('style','display:none');
            return 0;
        }

        ($('.memeCloud-currentLocalization').val() == -420 ? $('.memeCloud-backButton').attr('style','display:none') : $('.memeCloud-backButton').attr('style','display: inline-block'));

        $('.flexItemParentMemes').empty();
        $('.flexItemParentPaths').empty();

        $(call.path).each(function(){
            $('.flexItemParentPaths').append(renderDirectory(this.id, this.name));
        })

        $(call.meme).each(function(index, value){
            console.log(this);
            $('.flexItemParentMemes').append('<span class="memeCloud-memeContainer"><img class="memeCloud-meme btn" crossorigin="anonymous"  id="'+index+'" src="https://memecloud.co/imgs/'+this.checksum+'.jpeg" /></span>');
        });
    })
}

function renderDirectory(id, name) {
    let dir =   '<div class="m-2 dirItem rounded flex-item">'+
                    '<a class="dirRoute">'+
                        '<div class="directoryImgDiv h-100">'+
                            '<svg class="svg-inline--fa fa-folder fa-w-16 directoryImg fa-2x" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="folder" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"></path></svg>'+
                        '</div>'+
                        '<div class="directoryPathNameDiv h-100">'+
                            '<span data-id="'+id+'">' + name + '</span>'+
                        '</div>'+
                    '</a>'+
                '</div>';

    return dir;
}

function renderMeme(id, name, checksum) {

}

$(document).on('click', '.memeCloud-addbtn', function(event){
    event.preventDefault();
    let url = $(this).data('url');
    let name = prompt("Podaj nazwe mema");

    let data = {
                url: url,
                name: name
            };
    if(name){
        Communication(actions.addmeme, data, function(call){
            if(call != response.tokenError && call.code == 200){
                console.log(call);
                getContent();
            }
        });
    }
})

$(document).on('click', '.memeCloud-sidetab', function(){
    if($('#memeCloud').attr('style') == 'right: -320px'){
        $('#memeCloud').attr('style', 'right: 0px');

        
    }else
        $('#memeCloud').attr('style', 'right: -320px');
})

$(document).on('click', '.memeCloud-btn', function(e){
    e.preventDefault();
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

$(document).on('click', '.dirItem', function(){
    let currentLocalization = $('.memeCloud-currentLocalization').val();
    let localization = $(this).find('span').attr('data-id');

    if(currentLocalization != -420)
        prevLocalization.push(currentLocalization);

    $('.memeCloud-currentLocalization').val(localization);
    getContent(localization);
})

$(document).on('click', '.memeCloud-logoutButton', function(){
    Communication(actions.logout, $(this), function(call){
        (call==response.logout ? getContent() : '');
    })
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