"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaselineStatus = void 0;
/**
 * Baseline compatibility status
 */
var BaselineStatus;
(function (BaselineStatus) {
    /** Feature is widely available across browsers */
    BaselineStatus["WidelyAvailable"] = "widely";
    /** Feature has recently become baseline */
    BaselineStatus["NewlyAvailable"] = "newly";
    /** Feature has limited availability */
    BaselineStatus["Limited"] = "limited";
    /** Feature is not baseline yet */
    BaselineStatus["NotBaseline"] = "not-baseline";
    /** Unknown status */
    BaselineStatus["Unknown"] = "unknown";
})(BaselineStatus || (exports.BaselineStatus = BaselineStatus = {}));
