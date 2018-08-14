// 起動
function callHtHack(tab) {
	chrome.tabs.sendMessage(tab.id, {
		text: "report_back"
	}, null);
}

// browser button
chrome.browserAction.onClicked.addListener(function(tab) {
	callHtHack(tab);
});

// 右クリック contextmenus
// chrome.contextMenus.create({
// 	"title": "htHack",
// 	"contexts": ["selection"],
// 	onclick: function(info, tab) {
// 		callHtHack(tab);
// 	}
// });