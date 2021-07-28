let prevLocalization = [-420]

$(document).ready(function(){
    makeButtonForImages();
    makeButtonForLazyLoadedImages();
    checkLogin();
})

function Communication(method, options, callback){
    chrome.runtime.sendMessage({method: method, options: options}, function(response) {
        if(callback){
            callback(response);
        }
    });
}

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
            $('.memeCloud-backButton').show();
            ($('.memeCloud-currentLocalization').val() == -420 ? getContent() : getContent($('.memeCloud-currentLocalization').val()));
        }else{
            $('.memeCloud-form').show();
            $('.memeCloud-backButton').hide();
        }
    });
}

function getContent(id_parent = null) {
    $('.pathsTreeBox').empty();
    Communication(actions.getcontent, id_parent, function(call){
        if(call==response.tokenError) {
            $('.memeCloud-form').attr('style','display:block');
            $('.memeCloud-nav').attr('style','display:none');
            return 0;
        }
        
        ($('.memeCloud-currentLocalization').val() == -420 ? $('.memeCloud-backButton').attr('style','display:none') : $('.memeCloud-backButton').attr('style','display: inline-block'));

        $('.itemParentMemes').empty();
        $('.itemParentPaths').empty();
        $('.directoriesHeader').empty();

        if(call.path)
            $('.directoriesHeader').append('<span class="mx-2">Directories</span>');
        

        $(call.path).each(function(){
            $('.itemParentPaths').append(renderDirectory(this.id, this.name));
        })

        let pathIco = '<span><svg style="color: #fff; pointer-events: none;width:7px;" class="svg-inline--fa fa-angle-right fa-w-8 mx-2" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="angle-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" data-fa-i2svg=""><path fill="currentColor" d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path></svg></span>';

        $(call.paths_tree).each(function(){
            if (this.previous_path_id) {
                $('.pathsTreeBox').append(pathIco + '<div class="previous_path" data-id="'+this.previous_path_id+'">'+this.previous_path_name+'</div>');
                $('.pathsTreeBox').append(pathIco + '<div>'+this.current_path_name+'</div>');
            } else {
                $('.pathsTreeBox').append(pathIco + '<div>'+this.current_path_name+'</div>');
            }
            console.log(this);
        })
        
        if(call.meme != "")
            $(call.meme).each(function(index, value){
                $('.itemParentMemes').append(renderMeme(this.name, this.checksum));
            });
        else
            $('.itemParentMemes').append('<img src="https://memecloud.co/assets/img/tenor.gif" />');
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

function renderMeme(name, checksum) {
    let memeHTML =   '<div class="pathItemMeme rounded flex-item m-2" data-meme-id="11">'+
                    '<div class="pathItemMemeDiv rounded-top w-100">'+
                        '<img class="singleMemeImg rounded-top" rel="lytebox" src="https://memecloud.co/imgs/'+checksum+'.png">'+
                    '</div>'+  
                    '<div class="directoryMemeNameDiv rounded-bottom">'+
                        '<span>'+name+'</span>'+
                    '</div>'+
                '</div>';

    return memeHTML;
}

$(document).on('click', '.memeCloud-addbtn', function(event){
    event.preventDefault();
    let url = $(this).data('url');
    let name = prompt("Podaj nazwe mema");

    let data = {
        url: url,
        name: name};
        
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

$(document).on('click', '.dirItem', function(){
    let currentLocalization = $('.memeCloud-currentLocalization').val();
    let localization = $(this).find('span').attr('data-id');

    if(currentLocalization != -420)
        prevLocalization.push(currentLocalization);

    $('.memeCloud-currentLocalization').val(localization);
    getContent(localization);
    console.log(prevLocalization);
})

$(document).on('click', '.pathsTreeItem', function(e){
    let previousLocalization = prevLocalization[prevLocalization.length - 1];
    let pathsTreeLocalization = e.target.dataset.id;

    if (pathsTreeLocalization) { 
        if (previousLocalization != -420 && prevLocalization.indexOf(previousLocalization) >= 0) {
            let index = prevLocalization.indexOf(previousLocalization);
            if (index > -1) {
                prevLocalization.splice(index, 1);
            }
        }    
        $('.memeCloud-currentLocalization').val(previousLocalization);
        getContent(pathsTreeLocalization);
        console.log(prevLocalization, previousLocalization);
    }
})

$(document).on('click', '.homePathsTreeButton', function(e){
    $('.memeCloud-currentLocalization').val("-420");
    getContent();
})

$(document).on('click', '.memeCloud-logoutButton', function(){
    Communication(actions.logout, $(this), function(call){
        (call==response.logout ? getContent() : '');
    })
})

$(document).on('click', '.singleMemeImg', async function(event){
    const response = await fetch('http://pngimg.com/uploads/light/light_PNG14422.png');
    const blob = await response.blob()

    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    alert("Meme copied!\n Just paste it wherever u want");
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