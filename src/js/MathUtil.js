var MathUtil = module.exports = {};

MathUtil.clamp = function(value, min, max) {
	min = min || 0;
	max = max || 1;
	return Math.max(Math.min(value, max), min);
};