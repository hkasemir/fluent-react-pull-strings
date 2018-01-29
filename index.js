var astUtils = require('jsx-ast-utils');
var walk = require('flow-jsx-walk').default;
var _ = require('lodash');

function findLocalizationKey(localizedNode) {
  return astUtils.getPropValue(
    astUtils.getProp(localizedNode.openingElement.attributes, 'id')
  );
}

function findChildNode(localizedNode) {
  return localizedNode.children.find(child => child.type === 'JSXElement');
}

function pullLocalizedDOMAttributes(node) {
  const localizedProps = astUtils.getPropValue(
    astUtils.getProp(node.openingElement.attributes, 'data-l10n-attrs')
  );

  return localizedProps.reduce((ftlRules, propName) => {
    return `${ftlRules}
    .${propName} = ${astUtils.getPropValue(astUtils.getProp(node.openingElement.attributes, propName))}`;
  }, '');
}

function findTranslatableMessages(node, localizationKey) {
  const childNode = findChildNode(node);
  if (astUtils.hasProp(childNode.openingElement.attributes, 'data-l10n-attrs')) {
    return pullLocalizedDOMAttributes(childNode);
  }
  const childText = _.get(childNode, 'children[0]', {});
  const message = childText.value || _.get(childText, 'expression.value');
  if (!message) {
    const componentType = _.get(childNode, 'openingElement.name.name');
    const error = `
     STRING_IMPORT_ERROR: no translated props or message provided to ${componentType}
     - add a "data-l10n-attrs" array with the propNames of the DOM Attributes to be translated
     - or pass in a non-empty translatable message as a child
     - check the component with the localization ID "${localizationKey}"
`;
    console.error(error);
    return error;
  }
  return _.trim(message);
}

module.exports = function(code) {
  let ftlRules = '';
  walk(code, {
    JSXElement: (node) => {
      if (astUtils.elementType(node.openingElement) !== 'Localized') {return;}
      const localizationKey = findLocalizationKey(node);
      const translatableMessages = findTranslatableMessages(node, localizationKey);
      const localizationRule = `${localizationKey} = ${translatableMessages}`;
      ftlRules += `${localizationRule}\n`;
    }
  });
  return ftlRules;
}
