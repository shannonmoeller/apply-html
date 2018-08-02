// Forked from https://github.com/choojs/nanomorph
// MIT - Copyright (c) 2016 Yoshua Wuyts

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;

function isSame(a, b) {
	if (a.id) {
		return a.id === b.id;
	}

	if (a.isSameNode) {
		return a.isSameNode(b);
	}

	if (a.tagName !== b.tagName) {
		return false;
	}

	if (a.type === TEXT_NODE) {
		return a.nodeValue === b.nodeValue;
	}

	return false;
}

function isProxy(node) {
	return node && node.dataset && node.dataset.proxy !== undefined;
}

function copyAttrs(newNode, oldNode) {
	const oldAttrs = oldNode.attributes;
	const newAttrs = newNode.attributes;
	let attrNamespaceURI = null;
	let attrValue = null;
	let fromValue = null;
	let attrName = null;
	let attr = null;

	for (let i = newAttrs.length - 1; i >= 0; --i) {
		attr = newAttrs[i];
		attrName = attr.name;
		attrNamespaceURI = attr.namespaceURI;
		attrValue = attr.value;
		if (attrNamespaceURI) {
			attrName = attr.localName || attrName;
			fromValue = oldNode.getAttributeNS(attrNamespaceURI, attrName);
			if (fromValue !== attrValue) {
				oldNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
			}
		} else if (!oldNode.hasAttribute(attrName)) {
			oldNode.setAttribute(attrName, attrValue);
		} else {
			fromValue = oldNode.getAttribute(attrName);
			if (fromValue !== attrValue) {
				// apparently values are always cast to strings, ah well
				if (attrValue === 'null' || attrValue === 'undefined') {
					oldNode.removeAttribute(attrName);
				} else {
					oldNode.setAttribute(attrName, attrValue);
				}
			}
		}
	}

	// Remove any extra attributes found on the original DOM element that
	// weren't found on the target element.
	for (let j = oldAttrs.length - 1; j >= 0; --j) {
		attr = oldAttrs[j];
		if (attr.specified !== false) {
			attrName = attr.name;
			attrNamespaceURI = attr.namespaceURI;

			if (attrNamespaceURI) {
				attrName = attr.localName || attrName;
				if (!newNode.hasAttributeNS(attrNamespaceURI, attrName)) {
					oldNode.removeAttributeNS(attrNamespaceURI, attrName);
				}
			} else if (!newNode.hasAttributeNS(null, attrName)) {
				oldNode.removeAttribute(attrName);
			}
		}
	}
}

function updateAttribute(newNode, oldNode, name) {
	if (newNode[name] !== oldNode[name]) {
		oldNode[name] = newNode[name];
		if (newNode[name]) {
			oldNode.setAttribute(name, '');
		} else {
			oldNode.removeAttribute(name);
		}
	}
}

// The "value" attribute is special for the <input> element since it sets the
// initial value. Changing the "value" attribute without changing the "value"
// property will have no effect since it is only used to the set the initial
// value. Similar for the "checked" attribute, and "disabled".
function updateInput(newNode, oldNode) {
	const newValue = newNode.value;
	const oldValue = oldNode.value;

	updateAttribute(newNode, oldNode, 'checked');
	updateAttribute(newNode, oldNode, 'disabled');

	if (newValue !== oldValue) {
		oldNode.setAttribute('value', newValue);
		oldNode.value = newValue;
	}

	if (newValue === 'null') {
		oldNode.value = '';
		oldNode.removeAttribute('value');
	}

	if (!newNode.hasAttributeNS(null, 'value')) {
		oldNode.removeAttribute('value');
	} else if (oldNode.type === 'range') {
		// this is so elements like slider move their UI thingy
		oldNode.value = newValue;
	}
}

function updateOption(newNode, oldNode) {
	updateAttribute(newNode, oldNode, 'selected');
}

function updateTextarea(newNode, oldNode) {
	const newValue = newNode.value;
	if (newValue !== oldNode.value) {
		oldNode.value = newValue;
	}

	if (oldNode.firstChild && oldNode.firstChild.nodeValue !== newValue) {
		// Needed for IE. Apparently IE sets the placeholder as the
		// node value and vise versa. This ignores an empty update.
		if (
			newValue === '' &&
			oldNode.firstChild.nodeValue === oldNode.placeholder
		) {
			return;
		}

		oldNode.firstChild.nodeValue = newValue;
	}
}

// Walk and morph a dom tree
function walk(newNode, oldNode) {
	if (!oldNode) {
		return newNode;
	} else if (!newNode) {
		return null;
	} else if (newNode.isSameNode && newNode.isSameNode(oldNode)) {
		return oldNode;
	} else if (newNode.tagName !== oldNode.tagName) {
		return newNode;
	}

	// eslint-disable-next-line no-use-before-define
	updateNode(newNode, oldNode);

	// eslint-disable-next-line no-use-before-define
	updateChildren(newNode, oldNode);

	return oldNode;
}

// diff elements and apply the resulting patch to the old node
// (obj, obj) -> null
export function updateNode(newNode, oldNode) {
	const nodeType = newNode.nodeType;
	const nodeName = newNode.nodeName;

	if (nodeType === ELEMENT_NODE) {
		copyAttrs(newNode, oldNode);
	}

	if (nodeType === TEXT_NODE || nodeType === COMMENT_NODE) {
		if (oldNode.nodeValue !== newNode.nodeValue) {
			oldNode.nodeValue = newNode.nodeValue;
		}
	}

	// Some DOM nodes are weird
	// https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
	if (nodeName === 'INPUT') updateInput(newNode, oldNode);
	else if (nodeName === 'OPTION') updateOption(newNode, oldNode);
	else if (nodeName === 'TEXTAREA') updateTextarea(newNode, oldNode);
}

// Update the children of elements
// (obj, obj) -> null
export function updateChildren(newNode, oldNode) {
	let oldChild;
	let newChild;
	let morphed;
	let oldMatch;

	// The offset is only ever increased, and used for [i - offset] in the loop
	let offset = 0;

	for (let i = 0; ; i++) {
		oldChild = oldNode.childNodes[i];
		newChild = newNode.childNodes[i - offset];

		// Both nodes are empty, do nothing
		if (!oldChild && !newChild) {
			break;

			// There is no new child, remove old
		} else if (!newChild) {
			oldNode.removeChild(oldChild);
			i--;

			// There is no old child, add new
		} else if (!oldChild) {
			if (isProxy(newChild) && newChild.realNode) {
				break;
			} else {
				oldNode.appendChild(newChild);
			}
			offset++;

			// Both nodes are the same, morph
		} else if (isSame(newChild, oldChild)) {
			morphed = walk(newChild, oldChild);
			if (morphed !== oldChild) {
				oldNode.replaceChild(morphed, oldChild);
				offset++;
			}

			// Both nodes do not share an ID or a placeholder, try reorder
		} else {
			oldMatch = null;

			// Try and find a similar node somewhere in the tree
			for (let j = i; j < oldNode.childNodes.length; j++) {
				if (isSame(oldNode.childNodes[j], newChild)) {
					oldMatch = oldNode.childNodes[j];
					break;
				}
			}

			// If there was a node with the same ID or placeholder in the old list
			if (oldMatch) {
				morphed = walk(newChild, oldMatch);
				if (morphed !== oldMatch) offset++;
				oldNode.insertBefore(morphed, oldChild);

				// It's safe to morph two nodes in-place if neither has an ID
			} else if (!newChild.id && !oldChild.id) {
				morphed = walk(newChild, oldChild);
				if (morphed !== oldChild) {
					oldNode.replaceChild(morphed, oldChild);
					offset++;
				}

				// Insert the node at the index if we couldn't morph or find a matching node
			} else {
				if (
					isProxy(newChild) &&
					!newChild.isSameNode(oldChild) &&
					newChild.realNode
				) {
					oldNode.insertBefore(newChild.realNode, oldChild);
				} else {
					oldNode.insertBefore(newChild, oldChild);
				}
				offset++;
			}
		}
	}
}

export function morph(a, b) {
	updateChildren(b, a);

	return a;
}
