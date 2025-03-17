export default {
  /**
   * Validation for required field
   * @param {*} req
   * @param {*} field
   * @returns
   */
  required: (req, field) => {
    if (!req[field] || (Array.isArray(req[field]) && req[field].length === 0)) {
      return { key: field, value: "required" };
    }
    return { key: field, value: "valid" };
  },

  /**
   * Validation for checking unique value
   * @param {*} req
   * @param {*} table
   * @param {*} field
   * @returns
   */
  unique: (req, table, field) => {
    let found = "valid";

    table.forEach((doc) => {
      if (doc[field] == req[field]) {
        found = `${field} is existing`;
        return;
      }
    });

    return found;
  },

  /**
   * Check results
   * @param {*} validation
   * @returns
   */
  check: (validation) => {
    let validated = {};

    validation.forEach((i) => {
      if (i.value != "valid") {
        validated[i.key] = i.value;
      }
    });

    if (Object.keys(validated).length > 0) {
      return { pass: false, result: validated };
    }
    return { pass: true, result: validated };
  },
};
