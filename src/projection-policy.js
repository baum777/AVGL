const TOP_LEVEL_KEYS = new Set(['version', 'identity', 'owner', 'scope', 'evidenceBoundary']);
const IDENTITY_KEYS = new Set(['id', 'revision']);
const OWNER_KEYS = new Set(['reference']);
const REFERENCE_KEYS = new Set(['type', 'id']);
const SCOPE_KEYS = new Set(['include', 'deny']);
const SELECTOR_KEYS = new Set(['objects', 'relations']);
const EVIDENCE_BOUNDARY_KEYS = new Set(['allowedStates', 'inferredHandling']);
const INFERRED_HANDLING_KEYS = new Set(['mode']);

const SOURCE_EVIDENCE_STATES = new Set(['EXPLICIT', 'OBSERVED']);
const INFERRED_MODES = new Set(['preserve_as_inferred', 'deny']);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function extraKeys(value, allowed) {
  if (!isRecord(value)) return [];
  return Object.keys(value).filter((key) => !allowed.has(key)).sort();
}

function validString(value, maxLength) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function normalizeStringList(values = []) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function normalizeRegistry(values) {
  if (values instanceof Set) return new Set(values);
  if (Array.isArray(values)) return new Set(values);
  return new Set();
}

function pushExtraKeyErrors(errors, value, allowed, path) {
  for (const key of extraKeys(value, allowed)) {
    errors.push({
      code: 'undeclared_field',
      path: `${path}.${key}`,
      message: `Undeclared field ${path}.${key} is not allowed.`
    });
  }
}

function validateSelectorSet(value, path, errors, relationRegistry) {
  if (!isRecord(value)) {
    errors.push({ code: 'invalid_selector_set', path, message: `${path} must be an object.` });
    return;
  }

  pushExtraKeyErrors(errors, value, SELECTOR_KEYS, path);

  for (const key of ['objects', 'relations']) {
    const list = value[key];
    if (!Array.isArray(list)) {
      errors.push({ code: 'invalid_selector_list', path: `${path}.${key}`, message: `${path}.${key} must be an array.` });
      continue;
    }

    for (const [index, item] of list.entries()) {
      const maxLength = key === 'objects' ? 240 : 160;
      if (!validString(item, maxLength)) {
        errors.push({
          code: 'invalid_selector',
          path: `${path}.${key}[${index}]`,
          message: `${path}.${key} entries must be non-empty strings no longer than ${maxLength} characters.`
        });
      }
    }

    for (const duplicate of duplicateValues(list.filter((item) => typeof item === 'string'))) {
      errors.push({
        code: 'duplicate_selector',
        path: `${path}.${key}`,
        message: `Duplicate selector ${duplicate} is not allowed.`
      });
    }
  }

  if (Array.isArray(value.relations)) {
    for (const relationType of value.relations) {
      if (typeof relationType === 'string' && !relationRegistry.has(relationType)) {
        errors.push({
          code: 'unknown_relation_type',
          path: `${path}.relations`,
          message: `Relation type ${relationType} is not present in the supplied relation registry.`
        });
      }
    }
  }
}

export function normalizeProjectionPolicy(policy) {
  if (!isRecord(policy)) return policy;
  return {
    version: policy.version,
    identity: isRecord(policy.identity) ? {
      id: policy.identity.id,
      revision: policy.identity.revision
    } : policy.identity,
    owner: isRecord(policy.owner) && isRecord(policy.owner.reference) ? {
      reference: {
        type: policy.owner.reference.type,
        id: policy.owner.reference.id
      }
    } : policy.owner,
    scope: isRecord(policy.scope) ? {
      include: isRecord(policy.scope.include) ? {
        objects: normalizeStringList(policy.scope.include.objects),
        relations: normalizeStringList(policy.scope.include.relations)
      } : policy.scope.include,
      deny: isRecord(policy.scope.deny) ? {
        objects: normalizeStringList(policy.scope.deny.objects),
        relations: normalizeStringList(policy.scope.deny.relations)
      } : policy.scope.deny
    } : policy.scope,
    evidenceBoundary: isRecord(policy.evidenceBoundary) ? {
      allowedStates: normalizeStringList(policy.evidenceBoundary.allowedStates),
      inferredHandling: isRecord(policy.evidenceBoundary.inferredHandling) ? {
        mode: policy.evidenceBoundary.inferredHandling.mode
      } : policy.evidenceBoundary.inferredHandling
    } : policy.evidenceBoundary
  };
}

export function validateProjectionPolicyShape(policy, options = {}) {
  const errors = [];
  const relationRegistry = normalizeRegistry(options.relationTypes);

  if (!isRecord(policy)) {
    return {
      ok: false,
      errors: [{ code: 'invalid_policy', path: '$', message: 'Projection policy must be an object.' }],
      policy: null
    };
  }

  pushExtraKeyErrors(errors, policy, TOP_LEVEL_KEYS, '$');

  if (policy.version !== '1') {
    errors.push({ code: 'unsupported_version', path: '$.version', message: 'Projection policy version must be "1".' });
  }

  if (!isRecord(policy.identity)) {
    errors.push({ code: 'invalid_identity', path: '$.identity', message: 'Policy identity is required.' });
  } else {
    pushExtraKeyErrors(errors, policy.identity, IDENTITY_KEYS, '$.identity');
    if (!validString(policy.identity.id, 160)) {
      errors.push({ code: 'invalid_policy_id', path: '$.identity.id', message: 'Policy id must be a non-empty string up to 160 characters.' });
    }
    if (!validString(policy.identity.revision, 160)) {
      errors.push({ code: 'invalid_policy_revision', path: '$.identity.revision', message: 'Policy revision must be a non-empty immutable revision identifier.' });
    }
  }

  if (!isRecord(policy.owner)) {
    errors.push({ code: 'missing_owner', path: '$.owner', message: 'Policy owner reference is required.' });
  } else {
    pushExtraKeyErrors(errors, policy.owner, OWNER_KEYS, '$.owner');
    const reference = policy.owner.reference;
    if (!isRecord(reference)) {
      errors.push({ code: 'missing_governance_reference', path: '$.owner.reference', message: 'An external governance reference is required.' });
    } else {
      pushExtraKeyErrors(errors, reference, REFERENCE_KEYS, '$.owner.reference');
      if (reference.type !== 'governance_record') {
        errors.push({ code: 'invalid_governance_reference_type', path: '$.owner.reference.type', message: 'Governance reference type must be governance_record.' });
      }
      if (!validString(reference.id, 240)) {
        errors.push({ code: 'invalid_governance_reference_id', path: '$.owner.reference.id', message: 'Governance reference id must be a non-empty string up to 240 characters.' });
      }
    }
  }

  if (!isRecord(policy.scope)) {
    errors.push({ code: 'invalid_scope', path: '$.scope', message: 'Policy scope is required.' });
  } else {
    pushExtraKeyErrors(errors, policy.scope, SCOPE_KEYS, '$.scope');
    validateSelectorSet(policy.scope.include, '$.scope.include', errors, relationRegistry);
    validateSelectorSet(policy.scope.deny, '$.scope.deny', errors, relationRegistry);
  }

  if (!isRecord(policy.evidenceBoundary)) {
    errors.push({ code: 'invalid_evidence_boundary', path: '$.evidenceBoundary', message: 'Evidence boundary is required.' });
  } else {
    pushExtraKeyErrors(errors, policy.evidenceBoundary, EVIDENCE_BOUNDARY_KEYS, '$.evidenceBoundary');

    const allowedStates = policy.evidenceBoundary.allowedStates;
    if (!Array.isArray(allowedStates)) {
      errors.push({ code: 'invalid_allowed_states', path: '$.evidenceBoundary.allowedStates', message: 'allowedStates must be an array.' });
    } else {
      for (const [index, state] of allowedStates.entries()) {
        if (!SOURCE_EVIDENCE_STATES.has(state)) {
          errors.push({
            code: 'invalid_allowed_state',
            path: `$.evidenceBoundary.allowedStates[${index}]`,
            message: 'Only EXPLICIT and OBSERVED may be listed in allowedStates; INFERRED has a separate handling rule and UNKNOWN is never projected as content.'
          });
        }
      }
      for (const duplicate of duplicateValues(allowedStates)) {
        errors.push({
          code: 'duplicate_evidence_state',
          path: '$.evidenceBoundary.allowedStates',
          message: `Duplicate evidence state ${duplicate} is not allowed.`
        });
      }
    }

    const inferredHandling = policy.evidenceBoundary.inferredHandling;
    if (!isRecord(inferredHandling)) {
      errors.push({ code: 'invalid_inferred_handling', path: '$.evidenceBoundary.inferredHandling', message: 'inferredHandling is required.' });
    } else {
      pushExtraKeyErrors(errors, inferredHandling, INFERRED_HANDLING_KEYS, '$.evidenceBoundary.inferredHandling');
      if (!INFERRED_MODES.has(inferredHandling.mode)) {
        errors.push({ code: 'invalid_inferred_mode', path: '$.evidenceBoundary.inferredHandling.mode', message: 'inferredHandling.mode must be preserve_as_inferred or deny.' });
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    policy: errors.length === 0 ? normalizeProjectionPolicy(policy) : null
  };
}

export function validateProjectionPolicy(policy, options = {}) {
  const shape = validateProjectionPolicyShape(policy, options);
  if (!shape.ok) return shape;

  const governanceReferences = normalizeRegistry(options.governanceReferences);
  const governanceId = shape.policy.owner.reference.id;
  if (!governanceReferences.has(governanceId)) {
    return {
      ok: false,
      errors: [{
        code: 'governance_reference_unverified',
        path: '$.owner.reference.id',
        message: `Governance reference ${governanceId} was not supplied as externally verified authority.`
      }],
      policy: null
    };
  }

  return shape;
}
