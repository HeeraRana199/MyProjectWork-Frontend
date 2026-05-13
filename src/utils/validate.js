/**
 * Lightweight validation helpers used before sending payloads to the backend.
 * Each entity validator returns { valid: boolean, errors: string[] }.
 *
 * Field-level rule helpers return null on success or an error message string.
 * The runRules helper composes them.
 */

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const isString = (v) => typeof v === 'string';
const isBlank = (v) => v == null || (isString(v) && v.trim() === '');

export const required = (label) => (v) => (isBlank(v) ? `${label} is required` : null);

export const maxLength = (label, max) => (v) =>
  isString(v) && v.length > max ? `${label} must be at most ${max} characters` : null;

export const minLength = (label, min) => (v) =>
  isString(v) && v.length < min ? `${label} must be at least ${min} characters` : null;

export const email = (label) => (v) =>
  !isBlank(v) && !EMAIL_REGEX.test(v) ? `${label} must be a valid email address` : null;

export const oneOf = (label, allowed) => (v) =>
  !isBlank(v) && !allowed.includes(v) ? `${label} must be one of: ${allowed.join(', ')}` : null;

const runRules = (value, rules) => {
  const errs = [];
  for (const rule of rules) {
    const err = rule(value);
    if (err) errs.push(err);
  }
  return errs;
};

/**
 * Run a set of rules against the named fields of an object.
 * spec: { fieldName: [rule, rule, ...], ... }
 * Returns { valid, errors: string[] }.
 */
export const validate = (payload, spec) => {
  const errors = [];
  for (const [field, rules] of Object.entries(spec)) {
    const value = payload?.[field];
    errors.push(...runRules(value, rules));
  }
  return { valid: errors.length === 0, errors };
};

// ─────────────────────────────────────────────────────────────────────────────
// Entity validators — keep aligned with backend Bean Validation rules.
// ─────────────────────────────────────────────────────────────────────────────

export const validateLogin = (p) =>
  validate(p, {
    email: [required('Email'), email('Email'), maxLength('Email', 150)],
    password: [required('Password')],
  });

export const validateRegister = (p) =>
  validate(p, {
    email: [required('Email'), email('Email'), maxLength('Email', 150)],
    password: [required('Password'), minLength('Password', 6)],
    role: [required('Role')],
  });

export const validateLeaderRegister = (p) =>
  validate(p, {
    email: [required('Email'), email('Email'), maxLength('Email', 150)],
    password: [required('Password'), minLength('Password', 6)],
  });

export const validateProject = (p) =>
  validate(p, {
    projectName: [required('Project name'), maxLength('Project name', 255)],
    tech: [required('Tech'), maxLength('Tech', 255)],
    outcome: [required('Outcome'), maxLength('Outcome', 1000)],
    role: [required('Role'), maxLength('Role', 255)],
    description: [maxLength('Description', 2000)],
  });

export const validateCertification = (p) =>
  validate(p, {
    certificationId: [required('Certification ID'), maxLength('Certification ID', 100)],
    certificationName: [required('Certification name'), maxLength('Certification name', 255)],
    certificationProvider: [required('Certification provider'), maxLength('Certification provider', 255)],
  });

export const validateAchievement = (p) =>
  validate(p, {
    type: [required('Type'), oneOf('Type', ['ACHIEVEMENT', 'ACTIVITY'])],
    title: [required('Title'), maxLength('Title', 255)],
    description: [maxLength('Description', 2000)],
  });

export const validateSkills = (p) =>
  validate(p, {
    programmings: [maxLength('Programming skills', 1000)],
    tools: [maxLength('Tools', 1000)],
    frameworks: [maxLength('Frameworks', 1000)],
  });

// Skill-chip text from the leader filter — just a length sanity cap.
export const validateFilterText = (s) =>
  validate({ value: s }, { value: [maxLength('Filter value', 100)] });
