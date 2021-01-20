LEGEND_HTML = '<div id="legend"><div><b>Legend</b><div>' +
    '<div class="block blocked"><h4>Blocked Feature</h4></div>' +
    '<div class="block attention"><h4>Feature behind schedule</h4></div>' +
    '<div class="block completed reviewrequired"><h4>Feature Complete, Code Review Required</h4></div>' +
    '<div class="block completed"><h4>Feature Complete, Code Reviewed</h4></div>' +
    '<div class="block wip"><h4>Feature In Progress</h4></div>' +
    '<div class="block"><h4>Feature Not Started but Still Deliverable on Time</h4></div>' +
    '</div>'
MANAGEMENTTEAMCOLORS = [];
TRIBECOLORS = [];
SCRUMTEAMCOLORS = [];
USEDCOLORS = [];

$(document).ready(function() {
    $('#viewChooser').change(function() {

        $('#tree').remove();
        $('#project').remove();
        $('#timeline').remove();

        if ($(this).attr('value') == '1') {
            buildTree();
            buildOwnerFilter();
        }


        if ($(this).attr('value') == '2')
            buildParkingLot();

        if ($(this).attr('value') == '3') {
            buildParkingLot();
            buildSequence();
        }

    });
});

function buildSequence() {
    var elementArray = [];
    var sequenceIdsByIteration = [];

    $('.feature').each(function() {
        var e = $(this);
        var sequence = parseFloat(e.attr('sequence'))
        var iteration = parseFloat(e.attr('iteration'));
        var id = e.attr('id');


        if (sequenceIdsByIteration[iteration] == undefined)
            sequenceIdsByIteration[iteration] = [];

        sequenceIdsByIteration[iteration].push([sequence, id]);

        elementArray[id] = e;
    });

    $('#project').remove();
    $('table').before('<div id="timeline"><h1>' + document.title + '</h1>' + LEGEND_HTML + '</div>');
    $('#legend').append('<div><br/>This chart lists all features in release order from top left to bottom right</div>');

    for (iteration in sequenceIdsByIteration) {
        sequenceIdsByIteration[iteration].sort(function(a, b) {
            return parseFloat(a[0]) - parseFloat(b[0]);
        });

        if (iteration == 999)
            $('#timeline').append('<h2>Features Requiring Proper Sequencing</h2><hr/>');
        else
            $('#timeline').append('<h2>Iteration ' + iteration + '</h2><hr/>');

        for (i in sequenceIdsByIteration[iteration]) {
            var feature = sequenceIdsByIteration[iteration][i];
            var obj = elementArray[feature[1]];
            $('#timeline').append(obj);
        }
    }
}

function buildTree() {
    var id;
    var title;
    var managementTeam;
    var tribe;
    var scrumTeam;
    var dCounter = 0;
    var sdCounter = 0;
    var fCounter = 0;
    var sfCounter = 0;
    $('table').before('<div id="tree"><ul><li>' + document.title + '<ul id="domains"></ul></li></ul></div>');

    $("tr").each(function(i, obj) {
        id = $(".id", obj).text().replace(/\./g, '-');
        title = $(".title", obj).text();
        title = CleanTitle(title);
        owner = $(".owner", obj).text()
        managementTeam = owner.substring(0, 2);
        tribe = managementTeam + owner.substring(2, 4);
        scrumTeam = owner;

        if (!(managementTeam in MANAGEMENTTEAMCOLORS) && (managementTeam.length == 2)) {
            MANAGEMENTTEAMCOLORS[managementTeam] = getColor();
        }

        if (!(tribe in TRIBECOLORS) && (tribe.length == 4)) {
            TRIBECOLORS[tribe] = getColor();
        }

        if (!(scrumTeam in SCRUMTEAMCOLORS) && (scrumTeam.length == 6)) {
            SCRUMTEAMCOLORS[scrumTeam] = getColor();
        }

        var arrId = id.split('-');

        //domains
        if (arrId.length == 1) {
            if (id != "")
                $('#domains').append('<li id="' + id + '">' + title + '<ul></ul></li>');
        }

        //Products
        if (arrId.length == 2) {
            $('#' + arrId[0] + ' > ul').append('<li id="' + id + '" owner="' + owner + '">' + title + '<ol></ol></li>');
        }

        //features
        if (arrId.length == 3) {
            if ($('#' + arrId[0] + '-' + arrId[1]).length == 0) {
                $('#' + arrId[0] + ' > ul').remove();

                if ($('#' + arrId[0] + ' > ol').length == 0)
                    $('#' + arrId[0]).append('<ol></ol>');

                $('#' + arrId[0] + ' > ol').append('<li id="' + id + '" owner="' + owner + '">' + title + '</p><ol></ol></li>');
            } else {
                $('#' + arrId[0] + '-' + arrId[1] + ' > ol').append('<li id="' + id + '" owner="' + owner + '">' + title + '<ol></ol></li>');
            }
        }

        //components
        if (arrId.length == 4) {
            $('#' + arrId[0] + '-' + arrId[1] + '-' + arrId[2] + ' > ol').append('<li id="' + id + '">' + title + '</li>');
        }
    });

    //the project and domain are represented by uls
    $('#tree LI').each(function() {
        var e = $(this);

        // number the project node
        wrapTextNode('p', '0.0', $(this));

        if (e.has('OL')) {
            $('LI', e).each(function() {
                var el = $(this);

                if (el.parents('OL OL').length > 0) {
                    //we're dealing with subfeatures
                    sfCounter++;
                    wrapTextNode('sf', dCounter + '.' + sdCounter + '.' + fCounter + '.' + sfCounter, $(this));
                } else {
                    if (el.parents('UL OL').length > 0) {
                        //we're dealing with features
                        sfCounter = 0;
                        fCounter++;
                        wrapTextNode('f', dCounter + '.' + sdCounter + '.' + fCounter, $(this));
                    } else {
                        if (el.parents('UL UL').length > 0) {
                            if (el.parents().length > 6) {
                                //we're dealing with subdomains
                                sfCounter = 0;
                                fCounter = 0;
                                sdCounter++;
                                wrapTextNode('sd', dCounter + '.' + sdCounter, $(this));
                            } else {
                                //we're dealing with domains
                                sfCounter = 0;
                                fCounter = 0;
                                sdCounter = 0;
                                dCounter = el.attr("id");
                                wrapTextNode('d', dCounter + '.' + sdCounter, $(this));
                            }
                        }
                    }
                }
            });
        }
    });
}

function wrapTextNode(type, numberPrefix, e) {
    var owner = e.attr("owner");

    e.contents().filter(function() {
        return this.nodeType == 3 && $.trim(this.nodeValue).length > 1;
    }).wrap(
        $('<a>').addClass(type).append(numberPrefix + " ").append(buildTeamName(owner)));
}

function buildTeamName(owner) {
    var returnValue = ""

    if (owner === undefined) {
        return null;
    }

    var m = owner.substring(0, 2);
    var t = owner.substring(2, 4);
    var s = owner.substring(4, 6);
    var targetM = "";
    var targetT = "";
    var targetS = "";

    
    targetM = $("#" + m).text();
    
    switch (t) {
        case "TA":
            targetT = "Tribe A";
            break;
        case "TB":
            targetT = "Tribe B";
            break;
        default:
            targetT = t;
            break;
    }

    switch (s) {
        case "S1":
            targetS = "SCRUM 1";
            break;
        case "S2":
            targetS = "SCRUM 2";
            break;
        case "S3":
            targetS = "SCRUM 3";
            break;
        default:
            targetS = "SCRUM X";
            break;
    }
    returnValue = $('<span>').addClass("teamstrip").addClass(owner).addClass(m + t).addClass(t).addClass(m)
        .append($('<i>').bind("click", function() { dimOtherGroups(m) }).append(targetM))
        .append(" ")
        .append($('<i>').bind("click", function() { dimOtherGroups(m + t) }).append(targetT))
        .append(" ")
        .append($('<i>').bind("click", function() { dimOtherGroups(owner) }).append(targetS));

    return returnValue;
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

function buildParkingLot() {
    var dCounter = 0;
    var sdCounter = 0;
    var fCounter = 0;
    var sfCounter = 0;
    var sequenceErrorCounter = -999;
    var domains = new Array();
    var featuresets = new Array();

    $('table').before('<div id="project"><h1>' + document.title + '</h1>' + LEGEND_HTML + '</div>');

    $("tr").each(function(i, obj) {
        var id = $(".id", obj).text().replace(/\./g, '-');
        var title = $(".title", obj).text();
        title = CleanTitle(title);
        var dueDate = new Date($(".dueDate", obj).text());
        dueDate.setDate(dueDate.getDate() + 7);
        var effort = parseFloat($(".effort", obj).text());
        var status = $(".status", obj).text();
        var sequence = parseFloat($(".sequence", obj).text());
        var owner = $(".owner", obj).text();
        var iteration = $(".iteration", obj).text();
        var reviewStatus = $(".reviewStatus", obj).text();
        if (reviewStatus != null)
            reviewStatus = reviewStatus.toLowerCase();

        var arrId = id.split('-');

        //domains
        if (arrId.length == 1) {
            if (id != "") {
                $('#project').append('<div id="' + id + '" class="domain"><h2>' + title + '</h2><div class="featuresets"></div></div>');
                domains[id] = title;
            }
        }

        //feature sets
        if (arrId.length == 2) {
            $('#' + arrId[0] + ' .featuresets').append('<div id="' + id + '" class="featureset"><h3>' + title + '</h3><div class="features"></div></div>');
            featuresets[id] = title;
        }

        //features
        if (arrId.length == 3) {
            if (sequence == null || isNaN(sequence)) {
                sequence = sequenceErrorCounter;
                iteration = 999;
                sequenceErrorCounter += 0.01;
            }

            var appendFeatureTo;
            var markup;

            if ($('#' + arrId[0] + '-' + arrId[1]).length == 0) {
                appendFeatureTo = arrId[0];
            } else {
                appendFeatureTo = arrId[0] + '-' + arrId[1] + ' .features';
            }

            var re = new RegExp('-', 'g');
            var idToRender = id.replace(re, '.');

            if (iteration == 999)
                sequence = "Not Properly Sequenced";

            markup = '<div id="' + id + '" class="feature" sequence="' + sequence + '" iteration="' + iteration + '">';
            markup += '<div class="sequenceNumber">' + sequence + '</div>';
            markup += '<h6>' + domains[arrId[0]] + ': ' + featuresets[arrId[0] + '-' + arrId[1]] + '<h6><h4>' + title + '</h4><h5>(' + idToRender + ')</h5><div class="owner">(' + owner + ')</div><div class="status"></div><div class="statusbar" effort="' + effort + '" burntDown="0"><div class="bar"></div></div><div class="dueDate">' + dueDate.toDateString('dd, MM') + '</div><div class="reviewStatus">' + reviewStatus + '</div></div>';


            $('#' + appendFeatureTo).append(markup);
        }

        //workitems
        if (arrId.length == 5 && status == "completed") {
            var featureStatusBar = $('#' + arrId[0] + '-' + arrId[1] + '-' + arrId[2] + ' > .statusbar');
            var burntDown = parseFloat(featureStatusBar.attr('burntDown'));
            burntDown += effort;
            featureStatusBar.attr('burntDown', burntDown);
        }

        if (arrId.length == 5 && status == "blocked") {
            $('#' + arrId[0] + '-' + arrId[1] + '-' + arrId[2]).addClass('blocked');
        }
    });

    //the project and domain are represented by uls
    $('#tree LI').each(function() {
        var e = $(this);

        // number the project node
        wrapTextNode('p', '0.0', $(this));

        if (e.has('OL')) {
            $('LI', e).each(function() {
                var el = $(this);

                if (el.parents('OL OL').length > 0) {
                    //we're dealing with subfeatures
                    sfCounter++;
                    wrapTextNode('sf', dCounter + '.' + sdCounter + '.' + fCounter + '.' + sfCounter, $(this));
                } else {
                    if (el.parents('UL OL').length > 0) {
                        //we're dealing with features
                        sfCounter = 0;
                        fCounter++;
                        wrapTextNode('f', dCounter + '.' + sdCounter + '.' + fCounter, $(this));
                    } else {
                        if (el.parents('UL UL').length > 0) {
                            if (el.parents().length > 6) {
                                //we're dealing with subdomains
                                sfCounter = 0;
                                fCounter = 0;
                                sdCounter++;
                                wrapTextNode('sd', dCounter + '.' + sdCounter, $(this));
                            } else {
                                //we're dealing with domains
                                sfCounter = 0;
                                fCounter = 0;
                                sdCounter = 0;
                                dCounter++;
                                wrapTextNode('d', dCounter + '.' + sdCounter, $(this));
                            }
                        }
                    }
                }
            });
        }
    });

    //populate our status bars
    $(".feature").each(function() {
        var effort = $('.statusbar', $(this)).attr('effort');
        var burntDown = $('.statusbar', $(this)).attr('burntDown');
        var percentage = Math.round((100 / effort) * burntDown);
        var dueDate = new Date($('.dueDate', $(this)).text());
        var reviewStatus = $('.reviewStatus', $(this)).text();


        var projectedDate = new Date();
        projectedDate.setDate(projectedDate.getDate() + (effort - burntDown));

        $('.bar', $(this)).css('width', percentage + '%');
        $('.status', $(this)).text(percentage + '%');

        if (percentage >= 100)
            $(this).addClass('completed');

        if (reviewStatus != 'no code review required' && reviewStatus != 'code reviewed')
            $(this).addClass('reviewrequired');

        else if (percentage > 0)
            $(this).addClass('wip');

        if (dueDate < projectedDate)
            $(this).addClass('attention');

        //if the effort - burntdown < days to due date set the background to red
    });


    //cleanup 
    $(".featureset").each(function() {
        if ($(this).children("div").children().length == 0)
            $(this).remove();
    });

    $(".domain").each(function() {
        if ($(this).children("div").children().length == 0)
            $(this).remove();
    });
}

function buildOwnerFilter() {
    $('#viewChooser').after('<ul id="ownerFilter"></ul>');
    $('#ownerFilter').append($('<li>').append($('<a>').attr('href', '#').bind("click", function() { loadStyles(MANAGEMENTTEAMCOLORS) }).append($('<span>').attr('class', 'tab').append("Show Mangement Groups"))));
    $('#ownerFilter').append($('<li>').append($('<a>').attr('href', '#').bind("click", function() { loadStyles(TRIBECOLORS) }).append($('<span>').attr('class', 'tab').append("Show Tribes"))));
    $('#ownerFilter').append($('<li>').append($('<a>').attr('href', '#').bind("click", function() { loadStyles(SCRUMTEAMCOLORS) }).append($('<span>').attr('class', 'tab').append("Show SCRUM Teams"))));

    //sheet.innerHTML = "div {border: 2px solid black; background-color: blue;}";

}

function loadStyles(colorArray) {
    $("style").remove()
    var sheet = document.createElement('style');

    for (item in colorArray) {
        sheet.innerHTML += "." + item + " {background-color:" + colorArray[item] + "; color:black;border-radius: 5px;} ";
    }

    document.body.appendChild(sheet);

}

function getColor() {
    var letters = 'ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];

        if (!(color in USEDCOLORS)) {
            USEDCOLORS[color];
            //console.log(USEDCOLORS);
        } else {
            color = getColor();
        }
    }
    return color;
}

function dimOtherGroups(owner) {
    console.log("[" + owner + "]");
    $('.teamstrip').each(function() {
        var e = $(this);
        e.parent().removeClass("dim");
        if (!e.hasClass(owner)) {
            e.parent().addClass("dim");
        }
    });
}
