const DefaultChangelogRenderer = require('nx/release/changelog-renderer').default;

const CORE_DEPENDENCY_TYPE = 'core-deps';
const ANGULAR_RE = /\bangular\b/i;
const OPENLAYERS_RE = /\b(?:openlayers|ol)\b/i;
const UPDATE_INTENT_RE =
  /\b(?:compatibility|migrat(?:e|ed|ion)|upgrad(?:e|ed|ing)|updat(?:e|ed|ing)|version)\b/i;

function isCoreDependencyChange(change) {
  const description = change.description || '';
  const isCandidateType = change.type === 'docs' || change.type === 'chore';
  const isAngularUpdate =
    isCandidateType && ANGULAR_RE.test(description) && UPDATE_INTENT_RE.test(description);
  const isOpenLayersUpdate =
    change.type === 'chore' &&
    change.scope?.toLowerCase() === 'deps' &&
    OPENLAYERS_RE.test(description) &&
    UPDATE_INTENT_RE.test(description);

  return isAngularUpdate || isOpenLayersUpdate;
}

function selectChangelogChanges(changes) {
  return changes.flatMap((change) => {
    if (change.type !== 'docs' && change.type !== 'chore') {
      return [change];
    }

    return isCoreDependencyChange(change) ? [{ ...change, type: CORE_DEPENDENCY_TYPE }] : [];
  });
}

class CoreDependencyChangelogRenderer extends DefaultChangelogRenderer {
  constructor(config) {
    super({
      ...config,
      changes: selectChangelogChanges(config.changes),
    });
  }
}

module.exports = CoreDependencyChangelogRenderer;
module.exports.isCoreDependencyChange = isCoreDependencyChange;
