LEGEND_HTML = '<div id="legend"><div><b>Legend</b><div>' +
    '<div class="block blocked"><h4>Blocked Feature</h4></div>' +
    '<div class="block attention"><h4>Feature behind schedule</h4></div>' +
    '<div class="block completed reviewrequired"><h4>Feature Complete, Code Review Required</h4></div>' +
    '<div class="block completed"><h4>Feature Complete, Code Reviewed</h4></div>' +
    '<div class="block wip"><h4>Feature In Progress</h4></div>' +
    '<div class="block"><h4>Feature Not Started but Still Deliverable on Time</h4></div>' +
    '</div>'


$(document).ready(function () {
    buildTree();
});


function buildTree() {
    var id;
    var title;
    var repeat = false;
    var optional = false;
    var dCounter = 0;
    var sdCounter = 0;
    var fCounter = 0;
    var sfCounter = 0;
    $('table').before('<div id="tree"><ul><li>' + document.title + '<ul id="domains"></ul></li></ul></div>');

    $("tr").each(function (i, obj) {
        var id = $(".id", obj).text().replace(/\./g, '-');
        var title = CleanTitle($(".title", obj).text());
        var repeat = ($(".repeat", obj).text().trim().length >= 1);
        var optional = ($(".optional", obj).text().trim().length >= 1);
        var effort = $(".effort",obj).text().trim();
        var arrId = id.split('-');

        //domains
        if (arrId.length == 1) {
            if (id != "")
                $('#domains').append('<li id="' + id + '" effort="' + effort + '">' + title + '<ul></ul></li>');
        }

        //sub domains
        if (arrId.length == 2) {
            $('#' + arrId[0] + ' > ul').append('<li id="' + id + '" effort="' + effort + '">' + title + '<ol></ol></li>');
        }

        //features
        if (arrId.length == 3) {
            if ($('#' + arrId[0] + '-' + arrId[1]).length == 0) {
                $('#' + arrId[0] + ' > ul').remove();

                if ($('#' + arrId[0] + ' > ol').length == 0)
                    $('#' + arrId[0]).append('<ol></ol>');

                $('#' + arrId[0] + ' > ol').append('<li id="' + id + '" effort="' + effort + '">' + title + '<ol></ol></li>');
            } else {
                $('#' + arrId[0] + '-' + arrId[1] + ' > ol').append('<li id="' + id + '" effort="' + effort + '">' + title + '<ol></ol></li>');
            }
        }

        //components
        if (arrId.length == 4) {
            $('#' + arrId[0] + '-' + arrId[1] + '-' + arrId[2] + ' > ol').append('<li id="' + id + '" repeat="' + repeat + '" optional="' + optional + '"' + '" effort="' + effort + '">' + title + '<ol></ol></li>');
        }

        //work items
        if (arrId.length == 5) {
            $('#' + arrId[0] + '-' + arrId[1] + '-' + arrId[2] + '-' + arrId[3] + ' > ol ').append('<li id="' + id + '" repeat="' + repeat + '" optional="' + optional + '" effort="' + effort + '">' + title + '</li>');
        }
    });

    //the project and domain are represented by uls
    $('#tree LI').each(function () {
        var e = $(this);
        
        // number the project node
        wrapTextNode('p', '0.0', $(this));

        if (e.has('OL')) {
            $('LI', e).each(function () {
                var regex = new RegExp('-', 'g');
                var id = $(this).attr("id").replace(regex, '.');
                var arrId = id.split('.');
                
                switch(arrId.length) {
                    case 1:
                        wrapTextNode('d', id, $(this));
                    case 2:
                        wrapTextNode('sd', id, $(this));
                    case 3:
                        wrapTextNode('f', id, $(this));
                    case 4:
                        wrapTextNode('sf', id, $(this));
                    case 5:
                        wrapTextNode('wi', id, $(this));
                    default:
                }
                    
        })
        }
    });
    
    
    $("LI[repeat='true']").each(function() {
        $(this).children().first().append('<i class="repeatable">&nbsp;</i>')
    })
        
    $("LI[optional='true']").each(function() {
        $(this).children().first().append('<i class="optional">&nbsp;</i>')
    })
    
     $("LI[effort]").each(function() {
        $(this).children().first().append('<b class="effort">'+ $(this).attr("effort") + 'd</b>')
    })
    

    
}

function wrapTextNode(type, numberPrefix, e) {
    e.contents().filter(function () {
        var returnValue = this.nodeType == 3 && $.trim(this.nodeValue).length > 1;
        return returnValue;
    }).wrap('<a href="#" class="' + type + '" >' + numberPrefix + ' </a>');
}

function CleanTitle(title) {
    if (title.charAt(0) == "#" ||
        title.charAt(0) == ">" ||
        title.charAt(0) == "-" ||
        title.charAt(0) == "+" ||
        title.charAt(0) == "*") {
        title = title.slice(1).trim();
        title = CleanTitle(title);
    }

    return title;
}
