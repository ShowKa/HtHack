// (c) Shota Kanamoto

var rules, $revealed = $(), $revealedJQGColumn = $(),
    $activated = $(),
    $tip;

var storage = chrome.storage.sync;

// get options
storage.get({
    rules: []
}, function(items) {
    rules = items.rules;
});

// events in the Dom
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {

    var $rev, $act, flag;

    // reveal hiddens
    if (msg.subject == "revealHiddens") {

        storage.get(["revId", "revName", "revClass"], function(items) {
            flag = {
                id: items.revId,
                name: items.revName,
                class: items.revClass
            };
            $rev = $("input[type=hidden]").attr("type", "input");
            $rev.each(function() {
                var t = getElementInfoText(this, flag);
                $("<span>").text(t).addClass("htHack-reveald-label").insertBefore(this);
                this.title = t;
            });
            $rev.addClass("htHack-reveald");
            $revealed = $revealed.add($rev);
        });
        return;
    }

    // conceal hiddens
    if (msg.subject == "concealHiddens") {
        if ($revealed.length > 0) {
            $revealed.attr("type", "hidden").removeClass("htHack-reveald").removeAttr("title");
            $(".htHack-reveald-label").remove();
            // reset
            $revealed = $();
        }
        return;
    }

    // reveal hidden columns in jQgrid
    if (msg.subject == "revealHiddensJQgrid") {
        $(".ui-jqgrid:visible").each(function() {
            var $listTable = $(this);
            // th
            var $thJQG = $listTable.find(".ui-jqgrid-htable").find("th:hidden");
            // add header text
            $thJQG.children("div").each(function() {
                var $this = $(this);
                // if no textnoeds in header cell
                if(!$this.text()) {
                    var textPieces = this.id.split("_");
                    $this.prepend($("<div>").addClass("htHack-reveald-jQgrid-newHtText").text(textPieces[textPieces.length - 1]));
                }
            });
            // td
            var $tdJQG = $listTable.find(".ui-jqgrid-btable").find("td:hidden");
            // show
            $revealedJQGColumn = $revealedJQGColumn.add($thJQG.add($tdJQG).show().addClass("htHack-reveald-jQgrid"));
        });
        return;
    }

    // conceal hidden columns in jQgrid
    if (msg.subject == "concealHiddensJQgrid") {
        if($revealedJQGColumn.length > 0) {
            $revealedJQGColumn.hide().removeClass("htHack-reveald-jQgrid");
            $revealedJQGColumn.find(".htHack-reveald-jQgrid-newHtText").remove();
            $revealedJQGColumn = $();
        }
        return;
    }

    // activate disabled elements
    if (msg.subject == "activate") {
        $act = $(":disabled").prop("disabled", false);
        $act.addClass("htHack-activated");
        $activated = $activated.add($act);
        return;
    }

    // inactivate (disable)
    if (msg.subject == "inactivate") {
        $activated.prop("disabled", true).removeClass("htHack-activated");
        $activated = $();
        return;
    }

    // inspection
    if (msg.subject == "inspection") {
        storage.get({
            inspection: false
        }, function(items) {
            inspectHtml(items.inspection);
        });
        return;
    }

    // B-Tracker P in B
    if (msg.subject == "pInB") {
        storage.get({
            pInB: false
        }, function(items) {
            if(items.pInB) {
                var url = window.location.href;
                callPInB(url);
            } else {
                $(".htHack-pInB-Table").remove();
                $("#htHack-pInB").remove();
            }
        });
        return;
    }

    return;
});

$(document).ready(function(e) {
    var url = window.location.href;
    rules.some(function(v, i) {
        if (url.match("/" + v.url + "/")) {
            var $target = $(v.selector);
            if ($target.length > 0) {
                if (v.e == "focus") {
                    console.log("htHack : focus on " + v.selector);

                    $target.focus();
                } else if (v.e == "setColor") {
                    console.log("htHack : set color to " + v.selector);
                    $target.css({
                        borderBottom: "2px solid #ff3333",
                        color: "#ff3333"
                    });
                } else if (v.e == "triggerClick") {
                    console.log("htHack : trigger click" + v.selector);
                    $target.trigger("click");
                }
            } else {
                console.log("htHack : no target -> " + v.selector);
            }
        }
    });

    // add element inspection tooltip
    $tip = $("<div>").addClass("htHack-tooltip");
    $("body").append($tip);

    // show if inspection = on
    storage.get({
        inspection: false
    }, function(items) {
        inspectHtml(items.inspection);
    });

    // B-Tracker P In B
    // show if P in B Switch = on
    storage.get({
        pInB: false
    }, function(items) {
        if (items.pInB) {
            callPInB(url);
        }
    });
});
// B-Tracker P in B
function callPInB(url) {
    if(url.match("btracker2.ads.ines.co.jp/b_tracker/F020108_EditBugData.aspx")) {
        var bid = getBidFromUrl(url);
        pInB(bid);
    } else if (url.match("btracker2.ads.ines.co.jp/b_tracker/F020105_BugSearch.aspx")) {
        pInBTable();
    }
}
// B-Tracker P in B
function pInB(bid) {
    if (bid) {
        var $pHyo = $('<div id="htHack-pInB">');
        $("body").append($pHyo);
        // http://btracker2.ads.ines.co.jp/b_tracker/F020109_EditPHyo_Module.aspx?pj_id=021410-001&N_BID=005162
        var pHyoUrl = getPHyoBaseUrl() + bid;
        $pHyo.load(pHyoUrl + " " + "#GRD_PHYO_MODULE");
    }
}
// B-Tracker P in B
function pInBTable() {
    var $links = $("#GRD_BHYO_LIST").find("a[id$=_S_CUSTOMER_NO]");
    $links.each(function() {
        var $this = $(this);
        var href = $this.attr('href');
        var bid = getBidFromUrl(href);
        var pHyoUrl = getPHyoBaseUrl() + bid;
        var loadPHyoTable = pHyoUrl + " " + "#GRD_PHYO_MODULE";
        var tdId = bid + "_htHack";

        // create pHyo table
        var $pHyoTable = $("<div>").addClass("htHack-pInB-pHyoTable");
        var $td = $('<td id="' + tdId + '">').addClass("ItemStyle").append($pHyoTable);
        var $tr = $('<tr>').addClass("htHack-pInB-Table").append($td);
        var $table = $this.closest("tr").find("tbody").append($tr);
        $pHyoTable.load(loadPHyoTable);
        // modify modules
        var $regModules = $("<a>").addClass("htHack-pInB-pRegisterLink").text("Modules").attr({
            target: "_blank",
            href: pHyoUrl
        }).css("paddingRight", "7px");
        // rerload
        var $reload = $('<a>').addClass("htHack-pInB-reload").text("Reload").attr("href", "#dummy").click(function() {
            $pHyoTable.load(loadPHyoTable);
        });
        $td.prepend($reload);
        $td.prepend($regModules);
    });
}
// B-Tracker P in B
function getPHyoBaseUrl() {
    return "/b_tracker/F020109_EditPHyo_Module.aspx?pj_id=021410-001&N_BID=";
}
// B-Tracker P in B
function getBidFromUrl (url) {
    var bid_in_url = /N_BID=\d{4}/.exec(url);
    bid_in_url = bid_in_url + "=";
    return bid_in_url.split("=")[1];
}

function inspectHtml(lets) {
    if (lets) {
        $(document).on("mouseenter", "*", showElementInfo);
        $(document).on("mouseleave", "*", clearTooltip);

    } else {
        $(document).off("mouseenter", "*", showElementInfo);
        $tip.text("");
        $(".htHack-entered").removeClass("htHack-entered");
    }
    return;
}

function getElementInfoText(elm, get) {
    if (!get) get = {
        id: true,
        name: true,
        class: true
    };
    var t = "";
    if (elm.id && get.id) t = t + "#" + elm.id;
    if (elm.name && get.name) t = t + "[" + elm.name + "]";
    if (elm.className && get.class) t = t + "." + elm.className;
    return t;
}

function clearTooltip() {
    $(this).removeClass("htHack-entered");
}

// event listener
function showElementInfo(e) {
    var left, top, t;
    e.preventDefault();
    t = getElementInfoText(this);
    $tip.text(t);

    left = e.clientX;
    top = e.clientY;

    $tip.css({
        left: (left + 15) + "px",
        top: (top + 15) + "px"
    });

    $(".htHack-entered").removeClass("htHack-entered");
    $(this).addClass("htHack-entered");

    return false;
}