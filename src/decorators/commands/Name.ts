export const Name = (name: string) => (target: Function) => {
	// if (!(target.prototype instanceof Command)) {
	// 	throw new TypeError("The @Name decorator can only be used on Command and Event classes.");
	// }
	console.log(target.prototype);
	Object.defineProperty(target.prototype, "name", {
		value: name,
	});
};
