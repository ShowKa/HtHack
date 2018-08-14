var storage = chrome.storage.sync;
var buttons = ["revealHiddens", "concealHiddens", "activate", "inactivate", "revealHiddensJQgrid", "concealHiddensJQgrid"];
var checkboxes = ["inspection", "revId", "revName", "revClass", "pInB"];

(function() {
    var main, sendMessageFromPopup;

    main = function() {

        // button event
        $.each(buttons, function() {
            $('#' + this).on("click", function(e) {
                e.preventDefault();
                sendMessageFromPopup(this.id);
                return;
            });
        });

        // checkbox event
        $.each(checkboxes, function() {
            $('#' + this).on("click", function(e) {
                var checked = {};
                checked[this.id] = $(this).prop("checked");
                storage.set(checked);
                sendMessageFromPopup(this.id);
                return;
            });
        });

        // check box status
        storage.get(checkboxes, function(items) {
            $.each(checkboxes, function() {
                var status = items[this];
                if (!status) status = false;
                $('#' + this).prop("checked", status);
            });
        });

        return;
    };

    // send Message to htHack.js
    sendMessageFromPopup = function(subject) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                    from: 'popup',
                    subject: subject
                },
                null);
        });
        return;
    };

    // do!
    main();
}).call(this);