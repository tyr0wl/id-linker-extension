const rootSelectors = [
    ".notion-selectable.notion-page-block.notion-collection-item",
    // ".about-project-card .about-section",
    // ".wiki-markdown .markdown-renderer-async",
    // ".vc-preview-content-container .markdown-renderer-async",
];

const attrKey = "data-mscs-link";
const dataKey = attrKey;

const style = document.createElement('style');
style.innerHTML = '.mscs-link { color: #ee8249; } .mscs-link:hover { text-decoration: underline; cursor: mouse; }';

document.getElementsByTagName('head')[0].appendChild(style);

const baseExpression = /(\[msTicket#(\d+)\])/g;

const expressionMatchers = [
    { matcher: /(\[msTicket#(\d+)\])/g, urlTemplate: 'http://helpdesk.media-service.com/Lists/Tickets/DispForm.aspx?ID=' },
    { matcher: /(\&(\d+))/g, urlTemplate: 'http://helpdesk.media-service.com/Lists/Tickets/DispForm.aspx?ID=' },
    { matcher: /(\#(\d+))/g, urlTemplate: 'http://h-tfs1.core.media-service.com:8080/tfs/SharePoint/Development/_workitems/edit/' },
    { matcher: /(\!(\d+))/g, urlTemplate: 'http://h-tfs1.core.media-service.com:8080/tfs/SharePoint/Development/_git/Requests/pullrequest/' },
];

function renderLinks() {
    const textNodes = getAllTextNodes();

    for (const textNode of textNodes) {
        for (const expressionMatcher of expressionMatchers) {
            const matched = transformMatchedTextNodesToLinks(textNode, expressionMatcher);
            if (matched) {
                break;
            }
        }
    }
}

function getAllTextNodes() {
    const roots = [];

    for (const rootSelector of rootSelectors) {
        const root = document.querySelectorAll(rootSelector);
        if (root) {
            for (const rootElement of root) {
                const nodes = getTextNodes(rootElement);
                roots.push(...nodes);
            }
        }
    }

    return roots;
}

/**
 * @param {Element} beginningNode
 */
function getTextNodes(beginningNode) {
    const textNodes = [];
    let currentNode;
    const textNodeWalker = document.createTreeWalker(beginningNode, NodeFilter.SHOW_TEXT);

    while (currentNode = textNodeWalker.nextNode()) {
        textNodes.push(currentNode);
    }

    return textNodes;
}

/**
 * @param {Element} textNode
 * @param {{ matcher: RegExp, urlTemplate: string }} expressionMatcher
 */
function transformMatchedTextNodesToLinks(textNode, expressionMatcher) {
    const expression = new RegExp(expressionMatcher.matcher);

    let match;
    let matched = false;
    while ((match = expression.exec(textNode.textContent)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === expression.lastIndex) {
            expression.lastIndex++;
        }
        matched = true;

        const [tag, id] = match.slice(1);
        transformTextNodeToLink(textNode, expressionMatcher.urlTemplate + id);
    }

    return matched;
}

/**
 * @param {Element} textNode
 * @param {string} url
 */
function transformTextNodeToLink(textNode, url) {
    let parent = textNode.parentElement.parentElement;
    const attr = parent.getAttribute(attrKey);
    if (attr === textNode.textContent) {
        return;
    }

    parent.setAttribute(attrKey, textNode.textContent);
    parent.className = "mscs-link";

    parent = $(parent);
    let clickHandler = parent.data(dataKey);
    if (clickHandler) {
        parent.off("click", clickHandler);
    }
    clickHandler = (event) => {
        window.open(url);
        event.stopPropagation();
        event.preventDefault();
    };
    parent.data(dataKey, clickHandler);
    parent.on('click', clickHandler);
}


setInterval(() => {
    renderLinks("http://helpdesk.media-service.com/");
}, 5000);

