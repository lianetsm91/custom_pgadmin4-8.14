import gettext from 'sources/gettext';
import BaseUISchema from 'sources/SchemaView/base_schema.ui';

export function getRolePrivilegesSchema() {
  return new RolePrivilegesSchema();
}

class RolePrivilegesSchema extends BaseUISchema {
  get baseFields() {
    return [
      {
        id: 'type', label: gettext('Type'), type: 'text',
        editable: false, readonly: true, cell: 'string',
      }, {
        id: 'schema', label: gettext('Schema'), type: 'text',
        editable: false, readonly: true, cell: 'string',
      }, {
        id: 'objname', label: gettext('Object'), type: 'text',
        editable: false, readonly: true, cell: 'string',
      }, {
        id: 'privileges', label: gettext('Privileges'), type: 'text',
        editable: false, readonly: true, cell: 'plain-text',
        controlProps: { customStyle: { 'textWrap': 'auto' } }
      }];
  }
}
