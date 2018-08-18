// Forked from https://github.com/choojs/nanomorph
// MIT - Copyright (c) 2016 Yoshua Wuyts

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;

const REFLECTED_ATTRIBUTES = {
	checked: true,
	disabled: true,
	selected: true,
	value: true,
};

function reflectAttribute(a, b, name) {
	if (REFLECTED_ATTRIBUTES[name]) {
		a[name] = b[name];
	}
}

function isSameNode(a, b) {
	if (a.id) {
		return a.id === b.id;
	}

	if (a.nodeType !== b.nodeType) {
		return false;
	}

	if (a.tagName !== b.tagName) {
		return false;
	}

	return false;
}

export function morphNode(a, b) {
	switch (a.nodeType) {
		case COMMENT_NODE:
		case TEXT_NODE:
			a.nodeValue = b.nodeValue;

			break;

		case ELEMENT_NODE:
			if (a.outerHTML === b.outerHTML) {
				break;
			}

			if (a.tagName === b.tagName) {
				// eslint-disable-next-line no-use-before-define
				morphAttributes(a, b);
				// eslint-disable-next-line no-use-before-define
				morphChildren(a, b);
			} else {
				a.replaceWith(b);

				return b;
			}

			break;

		// no default
	}

	return a;
}

export function morphAttributes(a, b) {
	const aAttributes = Array.from(a.attributes);
	const bAttributes = Array.from(b.attributes);
	const attrSet = new Set();

	bAttributes.forEach((attr) => {
		const { namespaceURI, name, value } = attr;

		if (namespaceURI) {
			a.setAttributeNS(namespaceURI, attr.localName, value);
		} else {
			a.setAttribute(name, value);
		}

		reflectAttribute(a, b, name);

		attrSet.add(`${namespaceURI}.${name}`);
	});

	aAttributes.forEach((attr) => {
		const { namespaceURI, name } = attr;

		if (attrSet.has(`${namespaceURI}.${name}`)) {
			return;
		}

		if (namespaceURI) {
			a.removeAttributeNS(namespaceURI, attr.localName);
		} else {
			a.removeAttribute(name);
		}

		reflectAttribute(a, b, name);
	});

	return a;
}

export function morphChildren(a, b) {
	const aChildNodes = a.childNodes;
	const bChildNodes = b.childNodes;

	let i = 0;
	let offset = 0;

	for (; ; i++) {
		const aChild = aChildNodes[i];
		const bChild = bChildNodes[i - offset];

		if (!aChild && !bChild) {
			break;
		} else if (!aChild) {
			a.appendChild(bChild);
			offset++;
		} else if (!bChild) {
			a.removeChild(aChild);
			i--;
		} else if (isSameNode(aChild, bChild)) {
			morphNode(aChild, bChild);
		} else if (bChild.id) {
			const match = a.querySelector(`[id="${bChild.id}"]`);

			if (match && match.parentNode === a) {
				a.insertBefore(match, aChild);
				morphNode(match, bChild);
			} else {
				a.insertBefore(bChild, aChild);
				offset++;
			}
		} else if (aChild.nodeType !== bChild.nodeType) {
			a.insertBefore(bChild, aChild);
			offset++;
		} else {
			morphNode(aChild, bChild);
		}
	}

	return a;
}
