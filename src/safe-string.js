export class SafeString {
	constructor(value) {
		this.raw = String(value);

		Object.freeze(this);
	}

	get length() {
		return this.raw.length;
	}

	toJSON() {
		return this.raw;
	}

	toString() {
		return this.raw;
	}
}

Object.freeze(SafeString.prototype);
