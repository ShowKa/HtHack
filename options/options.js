var storage = chrome.storage.sync;
var options = [{
        value: "focus",
        text: "focus"
    }, {
        value: "setColor",
        text: "set color to red"
    }, {
        value: "triggerClick",
        text: "click"
    }, {
        value: "defaultValue",
        text: "default input"
    }]

// save
function saveRule(e) {

    storage.get({
        rules: []

    }, function(items) {

        var id = $("#id").val();
        if (!id) {
            id = Math.floor(Math.random() * 1000000).toString();
        }

        var rule = {
            id: id.trim(),
            url: $("#url").val().trim(),
            selector: $("#selector").val().trim(),
            e: $("#event").val().trim(),
            defaultValue: $("#defaultValue").val().trim()
        };

        var rules = items.rules;
        rules.some(function(v, i) {
            if (v.id == id) rules.splice(i, 1);
        });
        rules.push(rule);

        storage.set({
            rules: rules
        }, function() {

            restoreRules(e);

            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(function() {
                status.textContent = '　';
            }, 1500);
        });

    });


}

// Restores saved rules from chrome.storage
function restoreRules(e) {
    storage.get({
        rules: []

    }, function(items) {
        var _rules = items.rules;

        var $table = $("#rules").find("tbody");
        $table.empty();

        for (var i = _rules.length; i > 0; i--) {
            var r = _rules[i - 1],
                $tr = $("<tr>").attr("id", r.id),
                $td0 = $("<td>"),
                $td1 = $("<td>"),
                $td2 = $("<td>"),
                $td3 = $("<td>"),
                $td4 = $("<td>"),
                $td5 = $("<td>"),
                $buttonUpdate = $("<button>").text("update"),
                $buttonDel = $("<button>").text("delete");


            $table.append($tr);

            $buttonUpdate.on("click", setRuleIntoForm);
            $td0.append($buttonUpdate);
            $tr.append($td0);

            $buttonDel.on("click", deleteRule);
            $td1.append($buttonDel);
            $tr.append($td1);

            $td2.text(r.url);
            $tr.append($td2);

            $td3.text(r.selector);
            $tr.append($td3);

            $td4.text(r.e);
            $tr.append($td4);

            $td5.text(r.defaultValue);
            $tr.append($td5);


            if (i == _rules.length) {
                setFormVals(r);
            }

        }
    });
}

function setRuleIntoForm(e) {
    var id = $(this).closest("tr").attr("id");
    storage.get({
        rules: []
    }, function(items) {
        var rules = items.rules;
        rules.some(function(v, i) {
            if (v.id == id) {
                setFormVals(v);
            }
        });
    });
}

function deleteRule(e) {
    // TODO 
    var id = $(this).closest("tr").attr("id");
    storage.get({
        rules: []
    }, function(items) {
        var rules = items.rules;
        rules.some(function(v, i) {
            if (v.id == id) {
                rules.splice(i, 1);
            }
        });
        storage.set({
            rules: rules
        }, function() {
            restoreRules(e);
        });
    });
}

function setFormVals(data) {
    $("#id").val(data.id);
    $("#url").val(data.url);
    $("#selector").val(data.selector);
    $("#event").val(data.e);
    $("#defaultValue").val(data.defaultValue);
}

function clearForm(e) {
    setFormVals({
        id: "",
        url: "",
        selector: "",
        event: "",
        defaultValue: ""
    });
}

function removeAllRules(e) {
    if (confirm("Sure?")) {
        storage.remove('rules');
        clearForm(e);
        restoreRules(e);
    }
}

function addSelectOptions(e) {
    var $select = $("#event");
    $.each(options, function() {
        var $opt = $("<option>").text(this.text).val(this.value);
        $select.append($opt);
    });
}

// add event listener
$(document).ready(function(e) {
    addSelectOptions(e);
    restoreRules(e);
});
$("#save").on("click", saveRule);
$("#newOption").on("click", clearForm);
$("#remove").on("click", removeAllRules);