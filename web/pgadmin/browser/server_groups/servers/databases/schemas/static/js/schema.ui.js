/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2024, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

import gettext from 'sources/gettext';
import BaseUISchema from 'sources/SchemaView/base_schema.ui';
import { DefaultPrivSchema } from '../../../static/js/database.ui';
import SecLabelSchema from '../../../../static/js/sec_label.ui';
import { isEmptyString } from 'sources/validators';

export default class PGSchema extends BaseUISchema {
  constructor(getPrivilegeRoleSchema, fieldOptions = {}, initValues={}) {
    super({
      name: undefined,
      namespaceowner: undefined,
      description: undefined,
      is_system_obj: undefined,
      ...initValues
    });
    this.fieldOptions = {
      roles: [],
      server_info: [],
      ...fieldOptions,
    };
    this.getPrivilegeRoleSchema = getPrivilegeRoleSchema;
  }

  get idAttribute() {
    return 'oid';
  }

  get baseFields() {
    let pgSchemaObj = this;
    return [
      {
        id: 'name', label: gettext('Name'), cell: 'string',
        type: 'text',
      },{
        id: 'oid', label: gettext('OID'), cell: 'string',
        type: 'text', mode: ['properties'],
      },{
        id: 'namespaceowner', label: gettext('Owner'), cell: 'string',
        type: 'select',
        options: pgSchemaObj.fieldOptions.roles,
        controlProps: { allowClear: false }
      },{
        id: 'is_sys_obj', label: gettext('System schema?'),
        cell: 'switch', type: 'switch', mode: ['properties'],
      },{
        id: 'description', label: gettext('Comment'), cell: 'string',
        type: 'multiline',
      },{
        id: 'nspacl', label: gettext('Privileges'), type: 'collection',
        schema: pgSchemaObj.getPrivilegeRoleSchema(['C', 'U']),
        uniqueCol : ['grantee', 'grantor'], editable: false,
        group: gettext('Security'), mode: ['properties', 'edit', 'create'],
        canAdd: true, canDelete: true,
      },{
        id: 'deftblacl', label: gettext('Default TABLE privileges'), type: 'collection',
        group: gettext('Security'), mode: ['properties'], uniqueCol : ['grantee', 'grantor'],
        schema: this.getPrivilegeRoleSchema(['a', 'r', 'w', 'd', 'D', 'x', 't']),
        canAdd: true,
        canDelete: true,
      },{
        id: 'defseqacl', label: gettext('Default SEQUENCE privileges'), type: 'collection',
        group: gettext('Security'), mode: ['properties'], uniqueCol : ['grantee', 'grantor'],
        schema: this.getPrivilegeRoleSchema(['r', 'w', 'U']),
        canAdd: true,
        canDelete: true,
      },{
        id: 'deffuncacl', label: gettext('Default FUNCTION privileges'), type: 'collection',
        group: gettext('Security'), mode: ['properties'], uniqueCol : ['grantee', 'grantor'],
        schema: pgSchemaObj.getPrivilegeRoleSchema(['X']),
        canAdd: true,
        canDelete: true,
      },{
        id: 'deftypeacl', label: gettext('Default TYPE privileges'), type: 'collection',
        group: gettext('Security'), mode: ['properties'], uniqueCol : ['grantee', 'grantor'],
        min_version: 90200, schema: this.getPrivilegeRoleSchema(['U']),
        canAdd: true,
        canDelete: true,
      },
      {
        id: 'seclabels', label: gettext('Security labels'),
        schema: new SecLabelSchema(), editable: false, type: 'collection',
        group: gettext('Security'), mode: ['edit', 'create'],
        min_version: 90200, canAdd: true,
        canEdit: false, canDelete: true,
      },
      {
        type: 'nested-tab',
        group: gettext('Default privileges'),
        mode: ['create','edit'],
        schema: new DefaultPrivSchema(pgSchemaObj.getPrivilegeRoleSchema)
      }
    ];
  }

  validate(state, setError) {
    let errmsg = null;

    // Validation of mandatory fields
    if (isEmptyString(state.name)) {
      errmsg = gettext('Name cannot be empty.');
      setError('name', errmsg);
      return true;
    }
    else if(isEmptyString(state.namespaceowner)) {
      errmsg = gettext('Owner cannot be empty.');
      setError('namespaceowner', errmsg);
      return true;
    }
    return null;
  }
}
