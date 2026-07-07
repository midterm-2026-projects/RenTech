const VALID_TYPE_CHECKS = {
  string: (v) => typeof v === 'string',
  number: (v) => typeof v === 'number' && !Number.isNaN(v),
  boolean: (v) => typeof v === 'boolean',
  object: (v) => typeof v === 'object' && v !== null && !Array.isArray(v),
  array: (v) => Array.isArray(v),
};

export function validateRequest(fieldRules) {
  return (req, res, next) => {
    for (const rule of fieldRules) {
      const value = req.body[rule.name];

      if (rule.required && (value === undefined || value === null || value === '')) {
        return res.status(400).json({
          error: `Missing required field: "${rule.name}"`,
          field: rule.name,
          code: 'MISSING_FIELD',
        });
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rule.type && !VALID_TYPE_CHECKS[rule.type]) {
          return res.status(500).json({
            error: `Invalid validation rule: unknown type "${rule.type}"`,
            code: 'INVALID_RULE',
          });
        }

        if (rule.type && !VALID_TYPE_CHECKS[rule.type](value)) {
          return res.status(400).json({
            error: `Field "${rule.name}" must be of type ${rule.type}`,
            field: rule.name,
            expected: rule.type,
            code: 'WRONG_TYPE',
          });
        }
      }
    }

    next();
  };
}
